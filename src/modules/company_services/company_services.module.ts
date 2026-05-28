import { Module } from '@nestjs/common';
import { CompanyServicesService } from './company_services.service';
import { CompanyServicesController } from './company_services.controller';
import { CommonModule } from '@/common/common.module';
import { FirebaseModule } from '@/firebase/firebase.module';
import { PrismaModule } from '@/database/prisma/prisma.module';

@Module({
  imports: [CommonModule, FirebaseModule, PrismaModule],
  controllers: [CompanyServicesController],
  providers: [CompanyServicesService],
})
export class CompanyServicesModule {}
