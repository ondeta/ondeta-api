import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import { StatusServiceRequest } from '@/shared/enums';

export class DemandAnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'Start date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'End date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ description: 'Filter by company service ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  serviceId?: number;

  @ApiPropertyOptional({
    description: 'Filter by service request status',
    enum: StatusServiceRequest,
  })
  @IsOptional()
  @IsEnum(StatusServiceRequest)
  status?: StatusServiceRequest;
}
