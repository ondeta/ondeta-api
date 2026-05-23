import { AccountTypeGuard } from '@/common/guards/account-type/account-type.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AccountType } from '@/shared/enums';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('account-type')
export class AccountTypeController {
  @Get('user')
  @UseGuards(AccountTypeGuard(AccountType.User))
  @ApiBearerAuth()
  user() {
    return 'User account type';
  }

  @Get('company')
  @UseGuards(AccountTypeGuard(AccountType.Company))
  @ApiBearerAuth()
  company() {
    return 'Company account type';
  }
}
