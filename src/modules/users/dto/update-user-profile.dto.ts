import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class UpdateUserProfileDto {
  @ApiProperty({ description: 'Full name of the user', required: false })
  @IsOptional()
  @IsString()
  @Length(3, 150)
  full_name?: string;

  @ApiProperty({ description: 'Email address of the user', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'CPF number of the user',
    example: '12345678900',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(11, 11)
  @Matches(/^\d{11}$/, {
    message: 'CPF deve conter exatamente 11 dígitos',
  })
  cpf?: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '5511912345678',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(10, 15)
  phone_number?: string;
}
