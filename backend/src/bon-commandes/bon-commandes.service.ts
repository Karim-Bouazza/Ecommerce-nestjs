import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBonCommandeDto } from './dto/create-bon-commande.dto';
import { UpdateBonCommandeDto } from './dto/update-bon-commande.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import {
  BonCommande,
  BonCommandeDeliveryMethod,
  BonCommandeStatus,
} from './entities/bon-commande.entity';
import { BonCommandeItem } from './entities/bon-commande-item.entity';
import { FournisseurProfile } from '../users/entities/fournisseur-profile.entity';
import { Product } from '../products/entities/product.entity';
import { FournisseurProduct } from '../fournisseur-products/entities/fournisseur-product.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BonCommandesService {
  private static readonly TVA_RATE = 0.19;

  constructor(
    @InjectRepository(BonCommande)
    private readonly bonCommandeRepository: Repository<BonCommande>,
    @InjectRepository(BonCommandeItem)
    private readonly bonCommandeItemRepository: Repository<BonCommandeItem>,
    @InjectRepository(FournisseurProfile)
    private readonly fournisseurRepository: Repository<FournisseurProfile>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(FournisseurProduct)
    private readonly fournisseurProductRepository: Repository<FournisseurProduct>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  private roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private computeTotals(
    items: CreateBonCommandeDto['items'],
    isTvaIncluded: boolean,
  ) {
    const totalHt = this.roundMoney(
      items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    );

    if (!isTvaIncluded) {
      return { totalHt, totalTva: 0, totalTtc: totalHt };
    }

    const totalTva = this.roundMoney(totalHt * BonCommandesService.TVA_RATE);
    const totalTtc = this.roundMoney(totalHt + totalTva);

    return { totalHt, totalTva, totalTtc };
  }

  private async generateReference(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const last = await this.bonCommandeRepository
      .createQueryBuilder('bonCommande')
      .where('YEAR(bonCommande.createdAt) = :year', { year: currentYear })
      .orderBy('bonCommande.createdAt', 'DESC')
      .select([
        'bonCommande.id',
        'bonCommande.reference',
        'bonCommande.createdAt',
      ])
      .getOne();

    if (!last) {
      return `BC-0001/${currentYear}`;
    }

    const lastReference = last.reference;
    const lastNumber = parseInt(lastReference.split('/')[0].split('-')[1], 10);
    const nextNumber = lastNumber + 1;
    const padLength = nextNumber < 10000 ? 4 : 8;
    const padded = String(nextNumber).padStart(padLength, '0');

    return `BC-${padded}/${currentYear}`;
  }

  async create(createBonCommandeDto: CreateBonCommandeDto, userId?: number) {
    const {
      fournisseurId,
      items,
      isTvaIncluded = false,
      notes,
      deliveryMethod,
    } = createBonCommandeDto;

    const uniqueProductIds = Array.from(new Set(items.map((i) => i.productId)));
    if (uniqueProductIds.length !== items.length) {
      throw new ConflictException(
        'Chaque produit ne doit apparaître qu’une seule fois.',
      );
    }

    const fournisseur = await this.fournisseurRepository.findOne({
      where: { id: fournisseurId, isActive: true },
    });

    if (!fournisseur) {
      throw new NotFoundException('Fournisseur introuvable.');
    }

    const products = await this.productRepository.find({
      where: { id: In(uniqueProductIds), isActive: true },
    });

    if (products.length !== uniqueProductIds.length) {
      throw new NotFoundException('Produit introuvable.');
    }

    const allowedProductIds = await this.fournisseurProductRepository.find({
      where: {
        fournisseur: { id: fournisseurId },
        product: { id: In(uniqueProductIds) },
        isActive: true,
      },
      relations: ['product'],
    });

    if (allowedProductIds.length !== uniqueProductIds.length) {
      throw new ConflictException(
        'Le fournisseur doit avoir une relation active avec tous les produits.',
      );
    }

    const { totalHt, totalTva, totalTtc } = this.computeTotals(
      items,
      isTvaIncluded,
    );

    const reference = await this.generateReference();
    const createdBy = userId
      ? await this.userRepository.findOne({ where: { id: userId } })
      : null;

    return this.dataSource.transaction(async (manager) => {
      const bonCommandeRepo = manager.getRepository(BonCommande);
      const bonCommandeItemRepo = manager.getRepository(BonCommandeItem);

      const bonCommande = bonCommandeRepo.create({
        reference,
        status: BonCommandeStatus.EN_ATTENTE,
        deliveryMethod,
        createdBy: createdBy ?? null,
        fournisseur,
        notes,
        isTvaIncluded,
        totalHt,
        totalTva,
        totalTtc,
      });

      const savedBonCommande = await bonCommandeRepo.save(bonCommande);

      const productById = new Map(products.map((p) => [p.id, p]));

      const itemsToSave = items.map((item) =>
        bonCommandeItemRepo.create({
          bonCommande: savedBonCommande,
          product: productById.get(item.productId)!,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: this.roundMoney(item.quantity * item.unitPrice),
        }),
      );

      await bonCommandeItemRepo.save(itemsToSave);

      return savedBonCommande;
    });
  }

  async send(id: number, actorId: number) {
    return this.dataSource.transaction(async (manager) => {
      const bonCommandeRepo = manager.getRepository(BonCommande);

      const bonCommande = await bonCommandeRepo
        .createQueryBuilder('bonCommande')
        .setLock('pessimistic_write')
        .leftJoinAndSelect('bonCommande.createdBy', 'createdBy')
        .leftJoinAndSelect('bonCommande.fournisseur', 'fournisseur')
        .leftJoinAndSelect('fournisseur.user', 'supplierUser')
        .leftJoinAndSelect('bonCommande.items', 'items')
        .where('bonCommande.id = :id', { id })
        .getOne();

      if (!bonCommande) {
        throw new NotFoundException("La BonCommande n'existe pas");
      }

      if (bonCommande.status !== BonCommandeStatus.EN_ATTENTE) {
        throw new BadRequestException(
          "Seule une BonCommande en statut 'En attente' peut être envoyee.",
        );
      }

      if (!bonCommande.createdBy || bonCommande.createdBy.id !== actorId) {
        throw new ForbiddenException(
          'Seul le createur peut envoyer cette BonCommande.',
        );
      }

      if (!bonCommande.fournisseur) {
        throw new BadRequestException(
          "La BonCommande doit avoir un fournisseur avant d'etre envoyee.",
        );
      }

      if (!bonCommande.items || bonCommande.items.length === 0) {
        throw new BadRequestException(
          "La BonCommande doit avoir au moins un produit avant d'etre envoyee.",
        );
      }

      bonCommande.deliveryMethod = bonCommande.fournisseur.user
        ? BonCommandeDeliveryMethod.PLATFORM
        : BonCommandeDeliveryMethod.EMAIL;
      bonCommande.status = BonCommandeStatus.ENVOYE;
      bonCommande.sentBy = bonCommande.createdBy;
      bonCommande.sentAt = new Date();

      await bonCommandeRepo.save(bonCommande);

      return bonCommande;
    });
  }

  async confirm(id: number, actorId: number) {
    return this.dataSource.transaction(async (manager) => {
      const bonCommandeRepo = manager.getRepository(BonCommande);
      const userRepo = manager.getRepository(User);

      const bonCommande = await bonCommandeRepo
        .createQueryBuilder('bonCommande')
        .setLock('pessimistic_write')
        .leftJoinAndSelect('bonCommande.fournisseur', 'fournisseur')
        .where('bonCommande.id = :id', { id })
        .getOne();

      if (!bonCommande) {
        throw new NotFoundException("La BonCommande n'existe pas");
      }

      if (bonCommande.status !== BonCommandeStatus.ENVOYE) {
        throw new BadRequestException(
          "Seule une BonCommande en statut 'Envoye' peut etre confirmee.",
        );
      }

      const actor = await userRepo.findOne({
        where: { id: actorId, isActive: true },
        relations: ['fournisseurProfile'],
      });

      if (!actor || !actor.fournisseurProfile) {
        throw new ForbiddenException(
          "L'utilisateur n'est pas associe a un fournisseur.",
        );
      }

      if (bonCommande.fournisseur?.id !== actor.fournisseurProfile.id) {
        throw new ForbiddenException(
          'Seul le fournisseur peut confirmer cette BonCommande.',
        );
      }

      bonCommande.status = BonCommandeStatus.CONFIRME;
      bonCommande.approvedBy = actor;
      bonCommande.approvedAt = new Date();

      await bonCommandeRepo.save(bonCommande);

      return bonCommande;
    });
  }

  async cancel(id: number, actorId: number, cancellationReason?: string) {
    return this.dataSource.transaction(async (manager) => {
      const bonCommandeRepo = manager.getRepository(BonCommande);
      const userRepo = manager.getRepository(User);

      const bonCommande = await bonCommandeRepo
        .createQueryBuilder('bonCommande')
        .setLock('pessimistic_write')
        .leftJoinAndSelect('bonCommande.createdBy', 'createdBy')
        .leftJoinAndSelect('bonCommande.fournisseur', 'fournisseur')
        .where('bonCommande.id = :id', { id })
        .getOne();

      if (!bonCommande) {
        throw new NotFoundException("La BonCommande n'existe pas");
      }

      if (
        ![BonCommandeStatus.EN_ATTENTE, BonCommandeStatus.ENVOYE].includes(
          bonCommande.status,
        )
      ) {
        throw new BadRequestException(
          "Seule une BonCommande en statut 'Brouillon' ou 'Envoye' peut etre annulee.",
        );
      }

      const actor = await userRepo.findOne({
        where: { id: actorId, isActive: true },
        relations: ['fournisseurProfile'],
      });

      if (!actor) {
        throw new ForbiddenException("L'utilisateur n'est pas autorise.");
      }

      if (bonCommande.status === BonCommandeStatus.EN_ATTENTE) {
        if (!bonCommande.createdBy || bonCommande.createdBy.id !== actor.id) {
          throw new ForbiddenException(
            'Seul le createur peut annuler une BonCommande en brouillon.',
          );
        }
      } else {
        const isSupplier =
          !!actor.fournisseurProfile &&
          bonCommande.fournisseur?.id === actor.fournisseurProfile.id;
        const isCreator = bonCommande.createdBy?.id === actor.id;

        if (!isSupplier && !isCreator) {
          throw new ForbiddenException(
            'Seul le fournisseur ou le createur peut annuler une BonCommande envoyee.',
          );
        }
      }

      bonCommande.status = BonCommandeStatus.ANNULE;
      bonCommande.cancelledBy = actor;
      bonCommande.cancelledAt = new Date();
      bonCommande.cancellationReason = cancellationReason ?? '';

      await bonCommandeRepo.save(bonCommande);

      return bonCommande;
    });
  }

  findAll() {
    return `This action returns all bonCommandes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bonCommande`;
  }

  update(id: number, updateBonCommandeDto: UpdateBonCommandeDto) {
    return `This action updates a #${id} bonCommande`;
  }

  remove(id: number) {
    return `This action removes a #${id} bonCommande`;
  }
}
