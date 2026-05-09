import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { InternalProfile } from './entities/internal-profile.entity';
import { FournisseurProfile } from './entities/fournisseur-profile.entity';
import { UserResponseBuilderService } from '../common/utils/user-response-builder.service';
import { MyProfileController } from './my-profile.controller';
import { FournisseursController } from './fournisseurs.controller';
import { FournisseursService } from './fournisseurs.service';
import { MyProfileService } from './my-profile.service';
import { FournisseursWithoutUserService } from './fournisseurs-without-user.service';
import { FournisseursWithoutUserController } from './fournisseurs-without-user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, FournisseurProfile, InternalProfile]),
  ],
  controllers: [
    UsersController,
    MyProfileController,
    FournisseursController,
    FournisseursWithoutUserController,
  ],
  providers: [
    UsersService,
    UserResponseBuilderService,
    MyProfileService,
    FournisseursService,
    FournisseursWithoutUserService,
  ],
  exports: [TypeOrmModule, UserResponseBuilderService],
})
export class UsersModule {}
