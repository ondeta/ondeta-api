import { Module } from '@nestjs/common';
import { DemandAnalyticsController } from './demand-analytics.controller';
import { DemandAnalyticsService } from './demand-analytics.service';
import { FirebaseModule } from '@/firebase/firebase.module';
import { PrismaModule } from '@/database/prisma/prisma.module';

@Module({
  imports: [FirebaseModule, PrismaModule],
  controllers: [DemandAnalyticsController],
  providers: [DemandAnalyticsService],
})
export class DemandAnalyticsModule {}
