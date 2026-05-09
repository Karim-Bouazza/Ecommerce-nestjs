import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseGuards,
  SerializeOptions,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Role } from '../common/enum/role.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { ProductImageInterceptor } from '../common/interceptors/product-image.interceptor';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@SerializeOptions({ strategy: 'excludeAll' })
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  @ProductImageInterceptor()
  async create(
    @Body() createProductDto: CreateProductDto,

    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    const picturePath = file ? `uploads/products/${file.filename}` : undefined;

    const product = await this.productsService.create(
      createProductDto,
      picturePath,
    );

    return new ApiResponseDto(product, 'Produit créé avec succès.');
  }

  @Get()
  @Roles(Role.ADMIN, Role.COMMERCIAL, Role.OPERATEUR)
  async findAll() {
    const products = await this.productsService.findAll();
    return new ApiResponseDto(products, 'Produits récupérés avec succès.');
  }

  @Get(':codeBarre')
  @Roles(Role.ADMIN, Role.COMMERCIAL, Role.OPERATEUR)
  async findOne(@Param('codeBarre') codeBarre: string) {
    const product = await this.productsService.findOne(codeBarre);
    return new ApiResponseDto(product, 'Produit récupéré avec succès.');
  }

  @Get(':id/stocks')
  @Roles(Role.ADMIN, Role.COMMERCIAL, Role.OPERATEUR)
  async findStocks(@Param('id') id: string) {
    const productStocks = await this.productsService.findStocksByProductId(+id);
    return new ApiResponseDto(
      productStocks,
      'Stocks du produit récupérés avec succès.',
    );
  }

  @Patch(':codeBarre')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async update(
    @Param('codeBarre') codeBarre: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser('sub') userId?: number,
  ) {
    const product = await this.productsService.update(
      codeBarre,
      updateProductDto,
      userId,
    );
    return new ApiResponseDto(product, 'Produit mis à jour avec succès.');
  }

  @Delete(':codeBarre')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async remove(@Param('codeBarre') codeBarre: string) {
    const removedProduct = await this.productsService.remove(codeBarre);
    return new ApiResponseDto(removedProduct, 'Produit supprime avec succes');
  }
}
