import { Module } from '@nestjs/common';
import { UserAddressesService } from './user-addresses.service';
import { UserAddressesController } from './user-addresses.controller';
import { FirebaseModule } from '@/firebase/firebase.module';
import { PrismaModule } from '@/database/prisma/prisma.module';

@Module({
  imports: [FirebaseModule, PrismaModule],
  controllers: [UserAddressesController],
  providers: [UserAddressesService],
})
export class UserAddressesModule {}
