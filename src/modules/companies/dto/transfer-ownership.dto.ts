import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class TransferOwnershipDto {
  @ApiProperty({
    description: 'User ID to transfer company ownership to',
    example: 2,
  })
  @IsNotEmpty({ message: 'New owner user ID is required' })
  @IsNumber()
  new_owner_user_id!: number;
}
