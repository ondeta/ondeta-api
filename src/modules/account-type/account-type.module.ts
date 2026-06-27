import { Module } from '@nestjs/common';
import { AccountTypeController } from './account-type.controller';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [AccountTypeController],
})
export class AccountTypeModule {}
