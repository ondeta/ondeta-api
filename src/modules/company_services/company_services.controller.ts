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
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CompanyServicesService } from './company_services.service';
import { CreateCompanyServiceDto } from './dto/create-company-service.dto';
import { UpdateCompanyServiceDto } from './dto/update-company-service.dto';
import { AuthGuard } from '../auth/auth.guard';
import { IdToken } from '../auth/id-token.decorator';
import { FirebaseService } from '@/firebase/firebase.service';
import { Roles } from '@/common/decorators';
import { RolesGuard } from '@/common/guards';
import { Roles as RolesEnum } from '@/shared/enums';

@Controller('companies/:companyId/services')
export class CompanyServicesController {
  constructor(
    private readonly companyServicesService: CompanyServicesService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesEnum.Admin, RolesEnum.Owner)
  @ApiBearerAuth()
  async create(
    @IdToken() token: string,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() data: CreateCompanyServiceDto,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.companyServicesService.create(
      firebaseData.uid,
      companyId,
      data,
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all services offered by a company' })
  listByCompany(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.companyServicesService.findAllCatalogByCompanyId(companyId);
  }

  @Get(':serviceId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a service offered by a company' })
  findById(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('serviceId', ParseIntPipe) serviceId: number,
  ) {
    return this.companyServicesService.findOneCatalog(companyId, serviceId);
  }

  @Patch(':serviceId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesEnum.Admin, RolesEnum.Owner)
  @ApiBearerAuth()
  async update(
    @IdToken() token: string,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @Body() data: UpdateCompanyServiceDto,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.companyServicesService.update(
      firebaseData.uid,
      companyId,
      serviceId,
      data,
    );
  }

  @Delete(':serviceId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesEnum.Owner)
  @ApiBearerAuth()
  async remove(
    @IdToken() token: string,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('serviceId', ParseIntPipe) serviceId: number,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.companyServicesService.remove(
      firebaseData.uid,
      companyId,
      serviceId,
    );
  }
}
