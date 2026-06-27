import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Roles } from '@/shared/enums';

export class UpdateMembershipRoleDto {
  @ApiProperty({
    description: 'New role for the member',
    enum: Roles,
    example: Roles.Admin,
  })
  @IsNotEmpty()
  @IsEnum(Roles)
  role!: Roles;
}
