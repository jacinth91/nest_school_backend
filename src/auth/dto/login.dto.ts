import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Parent unique student ID (USID)' })
  @IsString()
  @IsNotEmpty()
  usid: string;

  @ApiProperty({ description: 'Parent password' })
  @IsString()
  @IsNotEmpty()
  password: string;
} 