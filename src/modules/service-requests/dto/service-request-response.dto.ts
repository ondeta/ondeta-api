import { ApiProperty } from '@nestjs/swagger';
import { StatusServiceRequest } from '@/shared/enums';

export class ServiceRequestResponseDto {
  @ApiProperty({ description: 'Service request ID' })
  id!: number;

  @ApiProperty({ description: 'User ID who created the request' })
  user_id!: number;

  @ApiProperty({ description: 'Company ID' })
  company_id!: number;

  @ApiProperty({ description: 'Company service ID' })
  company_service_id!: number;

  @ApiProperty({ description: 'Assigned vehicle ID', required: false })
  vehicle_id?: number | null;

  @ApiProperty({
    description: 'Current status',
    enum: StatusServiceRequest,
  })
  status!: StatusServiceRequest;

  @ApiProperty({ description: 'Additional notes', required: false })
  notes?: string | null;

  @ApiProperty({ description: 'Requested date', required: false })
  requested_date?: Date | null;

  @ApiProperty({ description: 'Scheduled date', required: false })
  scheduled_date?: Date | null;

  @ApiProperty({ description: 'Service start timestamp', required: false })
  started_at?: Date | null;

  @ApiProperty({ description: 'Service finish timestamp', required: false })
  finished_at?: Date | null;

  @ApiProperty({ description: 'Country' })
  country!: string;

  @ApiProperty({ description: 'State' })
  state!: string;

  @ApiProperty({ description: 'City' })
  city!: string;

  @ApiProperty({ description: 'Neighborhood' })
  neighborhood!: string;

  @ApiProperty({ description: 'Street' })
  street!: string;

  @ApiProperty({ description: 'Street number' })
  number!: string;

  @ApiProperty({ description: 'ZIP code' })
  zip_code!: string;

  @ApiProperty({ description: 'Latitude' })
  latitude!: number;

  @ApiProperty({ description: 'Longitude' })
  longitude!: number;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at!: Date;
}
