import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipRoleDto } from './dto/update-membership-role.dto';
import { AccountTypeGuard } from '@/common/guards/account-type/account-type.guard';
import { AccountType } from '@/shared/enums';

@Controller('memberships')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Post()
  @UseGuards(AccountTypeGuard(AccountType.Company))
  @ApiBearerAuth()
  async create(@Body() data: CreateMembershipDto) {
    return this.membershipsService.create(data);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.membershipsService.findById(id);
  }

  @Get('company/:companyId')
  async findByCompany(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.membershipsService.findByCompanyId(companyId);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.membershipsService.findByUserId(userId);
  }

  @Patch(':id')
  @UseGuards(AccountTypeGuard(AccountType.Company))
  @ApiBearerAuth()
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateMembershipRoleDto,
  ) {
    return this.membershipsService.updateRole(id, data);
  }

  @Delete(':id')
  @UseGuards(AccountTypeGuard(AccountType.Company))
  @ApiBearerAuth()
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.membershipsService.remove(id);
  }
}
