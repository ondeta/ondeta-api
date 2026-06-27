import { ApiProperty } from '@nestjs/swagger';

export class VehicleResponseDto {
  @ApiProperty({ description: 'Vehicle ID' })
  id!: number;

  @ApiProperty({ description: 'Company ID' })
  company_id!: number;

  @ApiProperty({ description: 'Vehicle name' })
  name_vehicle!: string;

  @ApiProperty({ description: 'Vehicle plate' })
  plate!: string;

  @ApiProperty({ description: 'Device identifier' })
  device_identifier!: string;

  @ApiProperty({ description: 'Creation date' })
  created_at!: Date;

  @ApiProperty({ description: 'Last update date' })
  updated_at!: Date;
}
