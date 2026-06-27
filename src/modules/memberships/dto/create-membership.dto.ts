import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsEnum, IsNotEmpty } from 'class-validator';
import { Roles } from '@/shared/enums';

export class CreateMembershipDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  user_id!: number;

  @ApiProperty({ description: 'Company ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  company_id!: number;

  @ApiProperty({
    description: 'Role of the member',
    enum: Roles,
    example: Roles.Member,
  })
  @IsNotEmpty()
  @IsEnum(Roles)
  role!: Roles;
}
