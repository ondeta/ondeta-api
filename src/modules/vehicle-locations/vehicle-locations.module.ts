import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { VehicleLocationsService } from './vehicle-locations.service';
import { VehicleLocationsController } from './vehicle-locations.controller';
import { FirebaseModule } from '@/firebase/firebase.module';
import { PrismaModule } from '@/database/prisma/prisma.module';

@Module({
  imports: [
    CacheModule.register({
      ttl: 24 * 60 * 60 * 1000,
      max: 500,
    }),
    FirebaseModule,
    PrismaModule,
  ],
  controllers: [VehicleLocationsController],
  providers: [VehicleLocationsService],
  exports: [VehicleLocationsService],
})
export class VehicleLocationsModule {}
