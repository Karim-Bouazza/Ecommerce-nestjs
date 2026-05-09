import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import {
  ProductDetailsResponseDto,
  ProductListResponseDto,
  ProductsResponseDto,
} from './dto/product-response.dto';
import { Category } from '../categories/entities/category.entity';
import { Brand } from '../brands/entities/brand.entity';
import { Depot } from '../depots/entities/depot.entity';
import { plainToInstance } from 'class-transformer';
import { DeleteProductResponseDto } from './dto/delete-product-response.dto';
import { ProductHistoryService } from './product-history.service';
import { User } from '../users/entities/user.entity';
import { Stock } from '../stocks/entities/stock.entity';
import { ProductStocksResponseDto } from './dto/product-stocks-response.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Depot)
    private readonly depotRepository: Repository<Depot>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly productHistoryService: ProductHistoryService,
  ) {}

  async create(createProductDto: CreateProductDto, imagePath?: string) {
    const { codeBarre, ref, categoryId, brandId, depotId, ...productData } =
      createProductDto;

    const existingProduct = await this.productRepository.findOne({
      where: [{ codeBarre }, { ref }],
    });
    if (existingProduct) {
      throw new ConflictException('Le produit existe deja');
    }

    const [category, brand, defaultDepot] = await Promise.all([
      categoryId
        ? this.categoryRepository.findOne({
            where: { id: categoryId, isActive: true },
          })
        : Promise.resolve(null),
      brandId
        ? this.brandRepository.findOne({
            where: { id: brandId, isActive: true },
          })
        : Promise.resolve(null),
      depotId
        ? this.depotRepository.findOne({
            where: { id: depotId, isActive: true },
          })
        : Promise.resolve(null),
    ]);

    if (categoryId && !category) {
      throw new NotFoundException('Categorie introuvable');
    }

    if (brandId && !brand) {
      throw new NotFoundException('Marque introuvable');
    }

    if (depotId && !defaultDepot) {
      throw new NotFoundException('Depot introuvable');
    }

    const product = await this.productRepository.create({
      ...productData,
      codeBarre,
      ref,
      image: imagePath ?? productData.image,
      category,
      brand,
      defaultDepot,
      stockTot: productData.stockIni,
    });
    const savedProduct = await this.productRepository.save(product);
    return new ProductsResponseDto(savedProduct);
  }

  async findAll() {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .select([
        'product.id',
        'product.codeBarre',
        'product.name',
        'product.stockTot',
        'product.stockMin',
      ])
      .where('product.isActive = :isActive', { isActive: true })
      .orderBy('product.createdAt', 'DESC')
      .getMany();

    return plainToInstance(ProductListResponseDto, products, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(codeBarre: string) {
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.defaultDepot', 'defaultDepot')
      .select([
        'product.id',
        'product.codeBarre',
        'product.ref',
        'product.name',
        'product.pv1Ht',
        'product.pv2Ht',
        'product.pv3Ht',
        'product.stockTot',
        'product.stockMin',
        'product.stockIni',
        'product.image',
        'product.createdAt',
        'product.updatedAt',
        'category.id',
        'category.name',
        'brand.id',
        'brand.name',
        'defaultDepot.id',
        'defaultDepot.name',
      ])
      .where('product.codeBarre = :codeBarre', { codeBarre })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .getOne();

    if (!product) {
      throw new NotFoundException('Produit introuvable');
    }

    return plainToInstance(
      ProductDetailsResponseDto,
      {
        ...product,

        pv1Ht: Number(product.pv1Ht),
        pv2Ht: Number(product.pv2Ht),
        pv3Ht: Number(product.pv3Ht),

        category: product.category?.name ?? null,
        brand: product.brand?.name ?? null,
        defaultDepot: product.defaultDepot?.name ?? null,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async findStocksByProductId(id: number) {
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect(
        'product.stocks',
        'stock',
        'stock.isActive = :stockActive',
        { stockActive: true },
      )
      .leftJoinAndSelect('stock.depot', 'depot')
      .select([
        'product.id',
        'product.codeBarre',
        'product.name',
        'stock.id',
        'stock.quantity',
        'depot.id',
        'depot.name',
      ])
      .where('product.id = :id', { id })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .getOne();

    if (!product) {
      throw new NotFoundException('Produit introuvable');
    }

    return new ProductStocksResponseDto(product as any);
  }

  async update(
    codeBarre: string,
    updateProductDto: UpdateProductDto,
    userId?: number,
  ) {
    const product = await this.productRepository.findOne({
      where: { codeBarre, isActive: true },
    });

    if (!product) {
      throw new NotFoundException('Produit introuvable');
    }

    if (
      updateProductDto.codeBarre &&
      updateProductDto.codeBarre !== product.codeBarre
    ) {
      const existingCodeBarre = await this.productRepository.findOne({
        where: { codeBarre: updateProductDto.codeBarre },
      });

      if (existingCodeBarre) {
        throw new ConflictException('Le code barre existe deja');
      }
    }

    if (updateProductDto.ref && updateProductDto.ref !== product.ref) {
      const existingRef = await this.productRepository.findOne({
        where: { ref: updateProductDto.ref },
      });

      if (existingRef) {
        throw new ConflictException('La reference existe deja');
      }
    }

    const oldProduct = { ...product } as Product;
    const { categoryId, brandId, depotId, ...productData } = updateProductDto;

    const [category, brand, defaultDepot] = await Promise.all([
      categoryId !== undefined
        ? this.categoryRepository.findOne({
            where: { id: categoryId, isActive: true },
          })
        : Promise.resolve(undefined),
      brandId !== undefined
        ? this.brandRepository.findOne({
            where: { id: brandId, isActive: true },
          })
        : Promise.resolve(undefined),
      depotId !== undefined
        ? this.depotRepository.findOne({
            where: { id: depotId, isActive: true },
          })
        : Promise.resolve(undefined),
    ]);

    if (categoryId !== undefined && !category) {
      throw new NotFoundException('Categorie introuvable');
    }

    if (brandId !== undefined && !brand) {
      throw new NotFoundException('Marque introuvable');
    }

    if (depotId !== undefined && !defaultDepot) {
      throw new NotFoundException('Depot introuvable');
    }

    Object.assign(product, productData);

    if (categoryId !== undefined) {
      product.category = category ?? null;
    }

    if (brandId !== undefined) {
      product.brand = brand ?? null;
    }

    if (depotId !== undefined) {
      product.defaultDepot = defaultDepot ?? null;
    }

    const savedProduct = await this.productRepository.save(product);

    const user = userId
      ? await this.userRepository.findOne({ where: { id: userId } })
      : null;

    await this.productHistoryService.createHistory(
      oldProduct,
      savedProduct,
      user ?? undefined,
    );

    return new ProductsResponseDto(savedProduct);
  }

  async remove(codeBarre: string) {
    const result = await this.productRepository.update(
      { codeBarre, isActive: true },
      { isActive: false },
    );

    if (!result.affected) {
      throw new NotFoundException('Produit introuvable');
    }

    return plainToInstance(
      DeleteProductResponseDto,
      {
        codeBarre,
        isActive: false,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
