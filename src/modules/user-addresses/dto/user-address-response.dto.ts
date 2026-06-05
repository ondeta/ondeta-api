import { ApiProperty } from '@nestjs/swagger';

export class UserAddressResponseDto {
  @ApiProperty({ description: 'Address ID' })
  id!: number;

  @ApiProperty({ description: 'Owner user ID' })
  user_id!: number;

  @ApiProperty({ description: 'Address label', required: false })
  label?: string | null;

  @ApiProperty({ description: 'Country', required: false })
  country!: string | null;

  @ApiProperty({ description: 'State', required: false })
  state!: string | null;

  @ApiProperty({ description: 'City', required: false })
  city!: string | null;

  @ApiProperty({ description: 'Neighborhood', required: false })
  neighborhood!: string | null;

  @ApiProperty({ description: 'Street', required: false })
  street!: string | null;

  @ApiProperty({ description: 'Street number', required: false })
  number!: string | null;

  @ApiProperty({ description: 'ZIP code', required: false })
  zip_code!: string | null;

  @ApiProperty({ description: 'Latitude', required: false })
  latitude!: number | null;

  @ApiProperty({ description: 'Longitude', required: false })
  longitude!: number | null;

  @ApiProperty({ description: 'Whether this is the default address' })
  is_default!: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at!: Date;
}
