import { ApiProperty } from '@nestjs/swagger';

export class DemandByNeighborhoodDto {
  @ApiProperty()
  neighborhood!: string;

  @ApiProperty()
  count!: number;

  @ApiProperty()
  percentage!: number;

  @ApiProperty()
  latitude!: number;

  @ApiProperty()
  longitude!: number;
}

export class DemandByHourDto {
  @ApiProperty({ description: 'Hour of day (0–23)' })
  hour!: number;

  @ApiProperty()
  count!: number;
}

export class DemandByServiceDto {
  @ApiProperty()
  service_id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  count!: number;

  @ApiProperty()
  percentage!: number;
}

export class DemandMapPointDto {
  @ApiProperty()
  latitude!: number;

  @ApiProperty()
  longitude!: number;

  @ApiProperty()
  weight!: number;

  @ApiProperty()
  neighborhood!: string;
}

export class DemandAnalyticsResponseDto {
  @ApiProperty()
  total!: number;

  @ApiProperty({ type: [DemandByNeighborhoodDto] })
  by_neighborhood!: DemandByNeighborhoodDto[];

  @ApiProperty({ type: [DemandByHourDto] })
  by_hour!: DemandByHourDto[];

  @ApiProperty({ type: [DemandByServiceDto] })
  by_service!: DemandByServiceDto[];

  @ApiProperty({ type: [DemandMapPointDto] })
  points!: DemandMapPointDto[];
}
