import { Module } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { MembershipsController } from './memberships.controller';
import { PrismaModule } from '@/database/prisma/prisma.module';
import { FirebaseModule } from '@/firebase/firebase.module';

@Module({
  imports: [PrismaModule, FirebaseModule],
  controllers: [MembershipsController],
  providers: [MembershipsService],
  exports: [MembershipsService],
})
export class MembershipsModule {}
