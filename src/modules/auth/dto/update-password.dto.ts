import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Current password for verification',
    minLength: 8,
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'Current password is required' })
  @IsString()
  @Length(8, 20, { message: 'Password must be between 8 and 20 characters' })
  current_password!: string;

  @ApiProperty({
    description: 'New password',
    minLength: 8,
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'New password is required' })
  @IsString()
  @Length(8, 20, { message: 'Password must be between 8 and 20 characters' })
  new_password!: string;

  @ApiProperty({
    description: 'Confirm new password',
    minLength: 8,
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'Password confirmation is required' })
  @IsString()
  confirm_password!: string;
}
