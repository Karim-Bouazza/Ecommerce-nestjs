import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { JwtModule } from '@nestjs/jwt';
import { CategoriesModule } from './categories/categories.module';
import { ProvincesModule } from './provinces/provinces.module';
import { CitiesModule } from './cities/cities.module';
import { ProductsModule } from './products/products.module';
import { DepotsModule } from './depots/depots.module';
import { BrandsModule } from './brands/brands.module';
import { StocksModule } from './stocks/stocks.module';
import { FournisseurProductsModule } from './fournisseur-products/fournisseur-products.module';
import { BonCommandesModule } from './bon-commandes/bon-commandes.module';
import ms from 'ms';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: parseInt(config.get('DB_PORT', '3306'), 10),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
        // to-do
        // logging: ['query', 'error'],
      }),
    }),
    UsersModule,
    AuthenticationModule,
    CategoriesModule,
    ProvincesModule,
    CitiesModule,
    ProductsModule,
    DepotsModule,
    BrandsModule,
    StocksModule,
    FournisseurProductsModule,
    BonCommandesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
