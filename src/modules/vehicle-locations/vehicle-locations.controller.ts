import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  UnauthorizedException,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { VehicleLocationsService } from './vehicle-locations.service';
import { CreateVehicleLocationDto } from './dto/create-vehicle-location.dto';
import { VehicleLocationResponseDto } from './dto/vehicle-location-response.dto';
import { AuthGuard } from '../auth/auth.guard';
import { IdToken } from '../auth/id-token.decorator';
import { DeviceIdentifier } from '@/common/decorators/device-identifier.decorator';
import { FirebaseService } from '@/firebase/firebase.service';

@Controller('vehicle-locations')
export class VehicleLocationsController {
  constructor(
    private readonly vehicleLocationsService: VehicleLocationsService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Post('track')
  @ApiHeader({
    name: 'X-Device-Identifier',
    description: 'Unique device identifier registered on the vehicle',
    required: true,
  })
  async track(
    @DeviceIdentifier() deviceIdentifier: string | null,
    @Body() data: CreateVehicleLocationDto,
  ): Promise<VehicleLocationResponseDto> {
    if (!deviceIdentifier) {
      throw new UnauthorizedException('X-Device-Identifier header is required');
    }

    return this.vehicleLocationsService.reportLocation(deviceIdentifier, data);
  }

  @Get('service-requests/:serviceRequestId/latest')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getLatest(
    @IdToken() token: string,
    @Param('serviceRequestId', ParseIntPipe) serviceRequestId: number,
  ): Promise<VehicleLocationResponseDto> {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.vehicleLocationsService.getLatestByServiceRequest(
      firebaseData.uid,
      serviceRequestId,
    );
  }

  @Get('service-requests/:serviceRequestId/history')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Max records to return (1–500, default 100)',
  })
  async getHistory(
    @IdToken() token: string,
    @Param('serviceRequestId', ParseIntPipe) serviceRequestId: number,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ): Promise<VehicleLocationResponseDto[]> {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.vehicleLocationsService.findHistoryByServiceRequest(
      firebaseData.uid,
      serviceRequestId,
      limit,
    );
  }
}
