import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
} from 'class-validator';

export class RegisterCompanyDto {
  @ApiProperty({ description: 'Company name' })
  @IsNotEmpty({ message: 'Company name is required' })
  @IsString()
  name_company!: string;

  @ApiProperty({ description: 'Email address of the company' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Password for company account' })
  @IsNotEmpty({ message: 'Password is required' })
  @Length(8, 20, { message: 'Password must be between 8 and 20 characters' })
  password!: string;

  @ApiProperty({
    description: 'CNPJ number of the company',
    example: '12345678900123',
  })
  @IsNotEmpty({ message: 'CNPJ is required' })
  @Length(14, 14, { message: 'CNPJ must be 14 digits' })
  @IsString()
  cnpj!: string;

  @ApiProperty({
    description: 'Phone number of the company',
    example: '5511912345678',
  })
  @IsOptional()
  @Length(10, 15, {
    message: 'Phone number must be between 10 and 15 characters',
  })
  @IsString()
  phone_number?: string;

  @ApiProperty({
    description: 'Company description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
