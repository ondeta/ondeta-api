import { Module } from '@nestjs/common';
import { ServiceRequestsService } from './service-requests.service';
import {
  ServiceRequestsController,
  CompanyServiceRequestsController,
} from './service-requests.controller';
import { CommonModule } from '@/common/common.module';
import { FirebaseModule } from '@/firebase/firebase.module';
import { PrismaModule } from '@/database/prisma/prisma.module';

@Module({
  imports: [CommonModule, FirebaseModule, PrismaModule],
  controllers: [ServiceRequestsController, CompanyServiceRequestsController],
  providers: [ServiceRequestsService],
  exports: [ServiceRequestsService],
})
export class ServiceRequestsModule {}
