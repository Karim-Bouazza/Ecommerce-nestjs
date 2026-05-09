import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { FournisseurProduct } from './entities/fournisseur-product.entity';
import { FournisseurProfile } from '../users/entities/fournisseur-profile.entity';
import { Product } from '../products/entities/product.entity';
import { CreateFournisseurProductsDto } from './dto/create-fournisseur-products.dto';
import { plainToInstance } from 'class-transformer';
import { FournisseurProductResponseDto } from './dto/fournisseur-product-response.dto';
import { ProductFournisseurResponseDto } from './dto/product-fournisseur-response.dto';
import { UpdateFournisseurProductDto } from './dto/update-fournisseur-product.dto';

@Injectable()
export class FournisseurProductsService {
  constructor(
    @InjectRepository(FournisseurProduct)
    private readonly fournisseurProductRepository: Repository<FournisseurProduct>,
    @InjectRepository(FournisseurProfile)
    private readonly fournisseurRepository: Repository<FournisseurProfile>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createForFournisseur(
    fournisseurId: number,
    dto: CreateFournisseurProductsDto,
  ) {
    const fournisseur = await this.fournisseurRepository.findOne({
      where: { id: fournisseurId, isActive: true },
    });

    if (!fournisseur) {
      throw new NotFoundException('Fournisseur introuvable');
    }

    const productIds = Array.from(
      new Set(dto.items.map((item) => item.productId)),
    );

    const products = await this.productRepository.find({
      where: { id: In(productIds), isActive: true },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('Produit introuvable');
    }

    const existing = await this.fournisseurProductRepository.find({
      where: {
        fournisseur: { id: fournisseurId },
        product: { id: In(productIds) },
      },
      relations: ['product'],
    });

    if (existing.length) {
      throw new ConflictException('Produit deja associe au fournisseur');
    }

    const productById = new Map(products.map((p) => [p.id, p]));

    const entities = dto.items.map((item) =>
      this.fournisseurProductRepository.create({
        fournisseur,
        product: productById.get(item.productId)!,
        paHt: item.paHt,
        quantity: item.quantity,
      }),
    );

    const saved = await this.fournisseurProductRepository.save(entities);

    return plainToInstance(FournisseurProductResponseDto, saved, {
      excludeExtraneousValues: true,
    });
  }

  async findAllForFournisseur(fournisseurId: number) {
    const fournisseur = await this.fournisseurRepository.findOne({
      where: { id: fournisseurId, isActive: true },
    });

    if (!fournisseur) {
      throw new NotFoundException('Fournisseur introuvable');
    }

    const items = await this.fournisseurProductRepository
      .createQueryBuilder('fp')
      .leftJoinAndSelect('fp.product', 'product')
      .leftJoinAndSelect('fp.fournisseur', 'fournisseur')
      .select([
        'fp.id',
        'fp.paHt',
        'fp.quantity',
        'fp.isActive',
        'product.id',
        'product.codeBarre',
        'product.name',
        'fournisseur.id',
      ])
      .where('fournisseur.id = :fournisseurId', { fournisseurId })
      .andWhere('fp.isActive = :isActive', { isActive: true })
      .getMany();

    return items.map((item) => new FournisseurProductResponseDto(item));
  }

  async findAllFournisseursByProduct(productId: number) {
    const product = await this.productRepository.findOne({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      throw new NotFoundException('Produit introuvable');
    }

    const items = await this.fournisseurProductRepository
      .createQueryBuilder('fp')
      .leftJoinAndSelect('fp.product', 'product')
      .leftJoinAndSelect('fp.fournisseur', 'fournisseur')
      .select([
        'fp.id',
        'fp.paHt',
        'fp.isActive',
        'product.id',
        'fournisseur.id',
        'fournisseur.companyName',
      ])
      .where('product.id = :productId', { productId })
      .andWhere('fp.isActive = :isActive', { isActive: true })
      .getMany();

    return items.map((item) => new ProductFournisseurResponseDto(item));
  }

  async updateFournisseurProduct(
    fournisseurId: number,
    productId: number,
    dto: UpdateFournisseurProductDto,
  ) {
    const relation = await this.fournisseurProductRepository
      .createQueryBuilder('fp')
      .leftJoinAndSelect('fp.fournisseur', 'fournisseur')
      .leftJoinAndSelect('fp.product', 'product')
      .select([
        'fp.id',
        'fp.paHt',
        'fp.quantity',
        'fp.isActive',
        'fournisseur.id',
        'product.id',
        'product.codeBarre',
        'product.name',
      ])
      .where('fournisseur.id = :fournisseurId', { fournisseurId })
      .andWhere('product.id = :productId', { productId })
      .andWhere('fp.isActive = :isActive', { isActive: true })
      .getOne();

    if (!relation) {
      throw new NotFoundException('Relation fournisseur-produit introuvable');
    }

    Object.assign(relation, dto);

    const saved = await this.fournisseurProductRepository.save(relation);

    return plainToInstance(FournisseurProductResponseDto, saved, {
      excludeExtraneousValues: true,
    });
  }

  async removeFournisseurProduct(fournisseurId: number, productId: number) {
    const result = await this.fournisseurProductRepository.update(
      {
        fournisseur: { id: fournisseurId },
        product: { id: productId },
        isActive: true,
      },
      { isActive: false },
    );

    if (!result.affected) {
      throw new NotFoundException('Relation fournisseur-produit introuvable');
    }

    return { fournisseurId, productId, isActive: false };
  }
}
