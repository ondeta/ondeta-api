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
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '@/common/guards/roles/roles.guard';
import { Roles } from '@/common/decorators/roles/roles.decorator';
import { IdToken } from '../auth/id-token.decorator';
import { FirebaseService } from '@/firebase/firebase.service';
import { Roles as RolesEnum } from '@/shared/enums';

@Controller('companies/:companyId/memberships')
export class MembershipsController {
  constructor(
    private readonly membershipsService: MembershipsService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesEnum.Admin, RolesEnum.Owner)
  @ApiBearerAuth()
  async create(
    @IdToken() token: string,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() data: CreateMembershipDto,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.membershipsService.create(firebaseData.uid, companyId, data);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  async listByCompany(
    @IdToken() token: string,
    @Param('companyId', ParseIntPipe) companyId: number,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.membershipsService.findByCompanyId(firebaseData.uid, companyId);
  }

  @Get(':memberId')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findById(
    @IdToken() token: string,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.membershipsService.findById(
      firebaseData.uid,
      companyId,
      memberId,
    );
  }

  @Patch(':memberId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesEnum.Owner)
  @ApiBearerAuth()
  async updateRole(
    @IdToken() token: string,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() data: UpdateMembershipRoleDto,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.membershipsService.updateRole(
      firebaseData.uid,
      companyId,
      memberId,
      data,
    );
  }

  @Delete(':memberId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesEnum.Owner)
  @ApiBearerAuth()
  async remove(
    @IdToken() token: string,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.membershipsService.remove(
      firebaseData.uid,
      companyId,
      memberId,
    );
  }
}
