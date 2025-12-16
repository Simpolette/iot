import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginAuthDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password: string;
}
