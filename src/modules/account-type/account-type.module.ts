import { Module } from '@nestjs/common';
import { AccountTypeController } from './account-type.controller';

@Module({
  controllers: [AccountTypeController],
})
export class AccountTypeModule {}
