import { ApiProperty } from '@nestjs/swagger';

export class AssignedMemberDto {
  @ApiProperty({ description: 'User ID of the assigned company member' })
  id!: number;

  @ApiProperty({ description: 'Full name', required: false })
  full_name?: string | null;

  @ApiProperty({ description: 'Phone number', required: false })
  phone_number?: string | null;
}
