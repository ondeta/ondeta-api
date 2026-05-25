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
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
