import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty } from 'class-validator';

export class AcceptServiceRequestDto {
  @ApiProperty({
    description: 'Date and time when the service will be performed at the customer location',
    example: '2026-06-15T14:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  scheduled_date!: string;

  @ApiProperty({
    description: 'Vehicle that will travel to the location on the scheduled date',
  })
  @IsNotEmpty()
  @IsInt()
  vehicle_id!: number;
}
