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
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleResponseDto } from './dto/vehicle-response.dto';
import { AuthGuard } from '../auth/auth.guard';
import { IdToken } from '../auth/id-token.decorator';
import { RolesGuard } from '@/common/guards';
import { Roles } from '@/common/decorators';
import { Roles as RolesEnum } from '@/shared/enums';
import { FirebaseService } from '@/firebase/firebase.service';

@Controller('companies/:companyId/vehicles')
export class VehiclesController {
  constructor(
    private readonly vehiclesService: VehiclesService,
    private firebaseService: FirebaseService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesEnum.Admin, RolesEnum.Owner)
  @ApiBearerAuth()
  async create(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() createVehicleDto: CreateVehicleDto,
    @IdToken() idToken: string,
  ): Promise<VehicleResponseDto> {
    const firebaseData = await this.firebaseService.verifyIdToken(idToken);
    if (!firebaseData) {
      throw new UnauthorizedException('Invalid ID token');
    }
    return this.vehiclesService.create(
      firebaseData.uid,
      companyId,
      createVehicleDto,
    );
  }

  @Get('/:vehicleId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async findById(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @IdToken() idToken: string,
  ): Promise<VehicleResponseDto> {
    const firebaseData = await this.firebaseService.verifyIdToken(idToken);
    if (!firebaseData) {
      throw new UnauthorizedException('Invalid ID token');
    }
    return this.vehiclesService.findById(firebaseData.uid, vehicleId);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async findByCompanyId(
    @Param('companyId', ParseIntPipe) companyId: number,
    @IdToken() idToken: string,
  ): Promise<VehicleResponseDto[]> {
    const firebaseData = await this.firebaseService.verifyIdToken(idToken);
    if (!firebaseData) {
      throw new UnauthorizedException('Invalid ID token');
    }
    return this.vehiclesService.findByCompanyId(firebaseData.uid, companyId);
  }

  @Patch('/:vehicleId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesEnum.Admin, RolesEnum.Owner)
  @ApiBearerAuth()
  async update(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Body() updateVehicleDto: UpdateVehicleDto,
    @IdToken() idToken: string,
  ): Promise<VehicleResponseDto> {
    const firebaseData = await this.firebaseService.verifyIdToken(idToken);
    if (!firebaseData) {
      throw new UnauthorizedException('Invalid ID token');
    }
    return this.vehiclesService.update(
      firebaseData.uid,
      vehicleId,
      updateVehicleDto,
    );
  }

  @Delete('/:vehicleId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesEnum.Owner)
  @ApiBearerAuth()
  async delete(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @IdToken() idToken: string,
  ): Promise<VehicleResponseDto> {
    const firebaseData = await this.firebaseService.verifyIdToken(idToken);
    if (!firebaseData) {
      throw new UnauthorizedException('Invalid ID token');
    }
    return this.vehiclesService.delete(firebaseData.uid, vehicleId);
  }
}
