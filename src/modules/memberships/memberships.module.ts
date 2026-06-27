import { Module } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { MembershipsController } from './memberships.controller';
import { PrismaModule } from '@/database/prisma/prisma.module';
import { FirebaseModule } from '@/firebase/firebase.module';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [PrismaModule, FirebaseModule, CommonModule],
  controllers: [MembershipsController],
  providers: [MembershipsService],
  exports: [MembershipsService],
})
export class MembershipsModule {}
