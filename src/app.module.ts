import { Module } from '@nestjs/common';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './database/prisma/prisma.service';
import { PrismaModule } from './database/prisma/prisma.module';
import { AccountTypeModule } from './modules/account-type/account-type.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { MembershipsModule } from './modules/memberships/memberships.module';
import { CommonModule } from './common/common.module';
import { CompanyServicesModule } from './modules/company_services/company_services.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { ServiceRequestsModule } from './modules/service-requests/service-requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    FirebaseModule.forRoot(),
    AuthModule,
    UsersModule,
    PrismaModule,
    AccountTypeModule,
    CompaniesModule,
    MembershipsModule,
    CompanyServicesModule,
    VehiclesModule,
    CommonModule,
    ServiceRequestsModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
