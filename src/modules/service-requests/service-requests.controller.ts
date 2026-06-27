import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ServiceRequestsService } from './service-requests.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';
import { AcceptServiceRequestDto } from './dto/accept-service-request.dto';
import { AuthGuard } from '../auth/auth.guard';
import { IdToken } from '../auth/id-token.decorator';
import { FirebaseService } from '@/firebase/firebase.service';
import { RolesGuard } from '@/common/guards';
import { Roles } from '@/common/decorators';
import { Roles as RolesEnum } from '@/shared/enums';

@Controller('companies/:companyId/service-requests')
export class CompanyServiceRequestsController {
  constructor(
    private readonly serviceRequestsService: ServiceRequestsService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Request a service from this company (authenticated user)',
  })
  async create(
    @IdToken() token: string,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() data: CreateServiceRequestDto,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.serviceRequestsService.create(
      firebaseData.uid,
      companyId,
      data,
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List service requests received by the company' })
  async listByCompany(
    @IdToken() token: string,
    @Param('companyId', ParseIntPipe) companyId: number,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.serviceRequestsService.findByCompany(
      firebaseData.uid,
      companyId,
    );
  }

  @Get(':requestId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a service request for the company' })
  async findByIdForCompany(
    @IdToken() token: string,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('requestId', ParseIntPipe) requestId: number,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    const request = await this.serviceRequestsService.findById(
      firebaseData.uid,
      requestId,
    );

    if (request.company_id !== companyId) {
      throw new ForbiddenException(
        'This request does not belong to this company',
      );
    }

    return request;
  }

  @Patch(':requestId/accept')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesEnum.Admin, RolesEnum.Owner)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Accept a pending request and schedule date, vehicle, and assigned member for the visit',
  })
  async accept(
    @IdToken() token: string,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body() data: AcceptServiceRequestDto,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.serviceRequestsService.acceptByCompany(
      firebaseData.uid,
      companyId,
      requestId,
      data,
    );
  }

  @Patch(':requestId/finish')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesEnum.Admin, RolesEnum.Owner)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Mark an in-route service request as finished so the vehicle can take the next one',
  })
  async finish(
    @IdToken() token: string,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('requestId', ParseIntPipe) requestId: number,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.serviceRequestsService.finishByCompany(
      firebaseData.uid,
      companyId,
      requestId,
    );
  }

  @Patch(':requestId/refuse')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesEnum.Admin, RolesEnum.Owner)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refuse a pending service request' })
  async refuse(
    @IdToken() token: string,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('requestId', ParseIntPipe) requestId: number,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.serviceRequestsService.refuseByCompany(
      firebaseData.uid,
      companyId,
      requestId,
    );
  }
}

@Controller('service-requests')
export class ServiceRequestsController {
  constructor(
    private readonly serviceRequestsService: ServiceRequestsService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List service requests made by the authenticated user',
  })
  async listByUser(@IdToken() token: string) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.serviceRequestsService.findByUser(firebaseData.uid);
  }

  @Get(':requestId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get details of a service request' })
  async findById(
    @IdToken() token: string,
    @Param('requestId', ParseIntPipe) requestId: number,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.serviceRequestsService.findById(firebaseData.uid, requestId);
  }

  @Patch(':requestId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a pending request before the company responds',
  })
  async update(
    @IdToken() token: string,
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body() data: UpdateServiceRequestDto,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.serviceRequestsService.updateByUser(
      firebaseData.uid,
      requestId,
      data,
    );
  }

  @Post(':requestId/cancel')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cancel a pending request before the company responds',
  })
  async cancel(
    @IdToken() token: string,
    @Param('requestId', ParseIntPipe) requestId: number,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.serviceRequestsService.cancelByUser(
      firebaseData.uid,
      requestId,
    );
  }
}
