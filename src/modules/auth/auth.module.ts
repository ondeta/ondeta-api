import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { PrismaModule } from '@/database/prisma/prisma.module';
import { FirebaseModule } from '@/firebase/firebase.module';

@Global()
@Module({
  imports: [PrismaModule, FirebaseModule],
  controllers: [AuthController],
  providers: [AuthGuard, AuthService],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
