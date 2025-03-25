import { IsString, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Phone number must be 10 digits' })
  phoneNumber: string;

  @IsString()
  @Matches(/^[0-9]{6}$/, { message: 'OTP must be 6 digits' })
  otp: string;
} 