import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEmail,
  Matches,
  Length,
} from 'class-validator';

export class UpdateCompanyProfileDto {
  @ApiProperty({ description: 'Name of the company' })
  @IsOptional()
  @IsString()
  @Length(3, 150)
  name_company?: string;

  @ApiProperty({ description: 'Email of the company' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'CNPJ of the company' })
  @IsOptional()
  @IsString()
  @Length(14, 14)
  @Matches(/^\d{14}$/, {
    message: 'CNPJ deve conter exatamente 14 dígitos',
  })
  cnpj?: string;

  @ApiProperty({ description: 'Phone number of the company' })
  @IsOptional()
  @IsString()
  @Length(10, 15)
  phone_number?: string;

  @ApiProperty({ description: 'Description of the company' })
  @IsOptional()
  @IsString()
  description?: string;
}
