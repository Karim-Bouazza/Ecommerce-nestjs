import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { FournisseurProductsService } from './fournisseur-products.service';
import { CreateFournisseurProductsDto } from './dto/create-fournisseur-products.dto';
import { UpdateFournisseurProductDto } from './dto/update-fournisseur-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enum/role.enum';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@Controller('fournisseurs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FournisseurProductsController {
  constructor(
    private readonly fournisseurProductsService: FournisseurProductsService,
  ) {}

  @Post(':id/products')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async createForFournisseur(
    @Param('id') id: string,
    @Body() dto: CreateFournisseurProductsDto,
  ) {
    const result = await this.fournisseurProductsService.createForFournisseur(
      +id,
      dto,
    );

    return new ApiResponseDto(
      result,
      'Produits fournisseur créés avec succès.',
    );
  }

  @Get(':id/products')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  @SerializeOptions({ strategy: 'excludeAll' })
  async getAllForFournisseur(@Param('id') id: string) {
    const items =
      await this.fournisseurProductsService.findAllForFournisseur(+id);

    return new ApiResponseDto(
      items,
      'Produits fournisseur récupérés avec succès.',
    );
  }

  @Get('products/:productId/fournisseurs')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  @SerializeOptions({ strategy: 'excludeAll' })
  async getAllFournisseursByProduct(@Param('productId') productId: string) {
    const items =
      await this.fournisseurProductsService.findAllFournisseursByProduct(
        +productId,
      );

    return new ApiResponseDto(
      items,
      'Fournisseurs du produit récupérés avec succès.',
    );
  }

  @Patch(':id/products/:productId')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async updateFournisseurProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateFournisseurProductDto,
  ) {
    const result =
      await this.fournisseurProductsService.updateFournisseurProduct(
        +id,
        +productId,
        dto,
      );

    return new ApiResponseDto(
      result,
      'Produit fournisseur mis à jour avec succès.',
    );
  }

  @Delete(':id/products/:productId')
  @Roles(Role.ADMIN, Role.COMMERCIAL)
  async removeFournisseurProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ) {
    const result =
      await this.fournisseurProductsService.removeFournisseurProduct(
        +id,
        +productId,
      );

    return new ApiResponseDto(
      result,
      'Produit fournisseur supprimé avec succès.',
    );
  }
}
