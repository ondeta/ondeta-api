import { Module } from '@nestjs/common';
import { AccountTypeController } from './account-type.controller';
import { RolesGuard } from '@/common/guards/roles/roles.guard';

@Module({
  controllers: [AccountTypeController],
  providers: [RolesGuard],
})
export class AccountTypeModule {}
