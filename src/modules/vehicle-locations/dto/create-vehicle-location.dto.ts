import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateVehicleLocationDto {
  @ApiProperty({ description: 'Latitude' })
  @IsNotEmpty()
  @IsNumber()
  latitude!: number;

  @ApiProperty({ description: 'Longitude' })
  @IsNotEmpty()
  @IsNumber()
  longitude!: number;

  @ApiProperty({
    description:
      'Service request being tracked. If omitted, the active request for the vehicle (agendado or em_rota) is used.',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  service_request_id?: number;
}
