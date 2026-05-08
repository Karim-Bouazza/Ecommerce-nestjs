import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { InternalProfile } from './entities/internal-profile.entity';
import { FournisseurProfile } from './entities/fournisseur-profile.entity';
import { UserResponseBuilderService } from '../common/utils/user-response-builder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, FournisseurProfile, InternalProfile]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UserResponseBuilderService],
  exports: [TypeOrmModule, UserResponseBuilderService],
})
export class UsersModule {}
