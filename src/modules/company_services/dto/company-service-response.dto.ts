import { ApiProperty } from '@nestjs/swagger';

export class CompanyServiceResponseDto {
  @ApiProperty({ description: 'Service ID' })
  id!: number;

  @ApiProperty({ description: 'Company ID' })
  company_id!: number;

  @ApiProperty({ description: 'Service name' })
  name_service!: string;

  @ApiProperty({ description: 'Service description', required: false })
  description?: string;

  @ApiProperty({ description: 'Base price for the service', required: false })
  base_price?: number;

  @ApiProperty({
    description: 'Estimated duration in minutes',
    required: false,
  })
  estimated_duration?: number;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at!: Date;
}
