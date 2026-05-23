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
  full_name!: string;

  @ApiProperty({ description: 'Email address of the user' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Password of the user' })
  @IsNotEmpty({ message: 'Password is required' })
  @Length(8, 20, { message: 'Password must be between 8 and 20 characters' })
  password!: string;

  @ApiProperty({
    description: 'CPF number of the user (optional)',
    example: '123.456.789-00',
  })
  @IsNotEmpty({ message: 'CPF is required' })
  @Length(11, 11, { message: 'CPF must be in the format XXX.XXX.XXX-XX' })
  @IsString()
  cpf!: string;

  @ApiProperty({
    description: 'Phone number of the user (optional)',
    example: '+55 11 91234-5678',
  })
  @IsNotEmpty({ message: 'Phone number is required' })
  @Length(10, 15, {
    message: 'Phone number must be between 10 and 15 characters',
  })
  @IsString()
  phone_number?: string;

  @ApiProperty({
    description: 'Type of the user account',
    example: ['user', 'company'],
  })
  @IsArray()
  @IsNotEmpty({ message: 'Account type is required' })
  @IsString({ each: true })
  account_type!: string[];
}
