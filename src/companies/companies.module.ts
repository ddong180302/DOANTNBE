import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from './schemas/company.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { Role, RoleSchema } from 'src/roles/schemas/role.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }])
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService]
})
export class CompaniesModule { }
