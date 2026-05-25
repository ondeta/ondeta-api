import { AccountTypeGuard } from '@/common/guards/account-type/account-type.guard';
import { RolesGuard } from '@/common/guards/roles/roles.guard';
import { Roles } from '@/common/decorators/roles/roles.decorator';
import {
  Controller,
  Get,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AccountType, Roles as Role } from '@/shared/enums';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Account Type')
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

  @Get('company/:companyId/owner')
  @UseGuards(RolesGuard)
  @Roles(Role.Owner)
  @ApiBearerAuth()
  testOwnerRole(@Param('companyId', ParseIntPipe) companyId: number) {
    return `User has Owner role in company ${companyId}`;
  }

  @Get('company/:companyId/admin')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Owner)
  @ApiBearerAuth()
  testAdminRole(@Param('companyId', ParseIntPipe) companyId: number) {
    return `User has Admin or Owner role in company ${companyId}`;
  }

  @Get('company/:companyId/member')
  @UseGuards(RolesGuard)
  @Roles(Role.Member, Role.Admin, Role.Owner)
  @ApiBearerAuth()
  testMemberRole(@Param('companyId', ParseIntPipe) companyId: number) {
    return `User has any role in company ${companyId}`;
  }
}
