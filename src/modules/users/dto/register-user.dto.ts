import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ description: 'Full name of the user' })
  @IsNotEmpty({ message: 'Full name is required' })
  @IsString()
  fullName!: string;

  @ApiProperty({ description: 'Email address of the user' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Password of the user' })
  @IsNotEmpty({ message: 'Password is required' })
  @Length(8, 20, { message: 'Password must be between 8 and 20 characters' })
  password!: string;

  @ApiProperty({
    description: 'Type of the user account',
    example: ['user', 'company'],
  })
  @IsArray()
  @IsNotEmpty({ message: 'Account type is required' })
  @IsString({ each: true })
  account_type!: string[];
}
