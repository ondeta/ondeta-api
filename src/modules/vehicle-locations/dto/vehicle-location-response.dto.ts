import { ApiProperty } from '@nestjs/swagger';

export class VehicleLocationResponseDto {
  @ApiProperty({ description: 'Location record ID' })
  id!: number;

  @ApiProperty({ description: 'Vehicle ID' })
  vehicle_id!: number;

  @ApiProperty({ description: 'Service request ID' })
  service_request_id!: number;

  @ApiProperty({ description: 'Latitude' })
  latitude!: number;

  @ApiProperty({ description: 'Longitude' })
  longitude!: number;

  @ApiProperty({ description: 'Timestamp when the location was recorded' })
  created_at!: Date;
}
