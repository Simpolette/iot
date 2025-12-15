import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDto {
    @IsMongoId({ message: 'Invalid user ID' })
    @IsNotEmpty({ message: 'User ID is required' })
    _id: string;

    @IsOptional()
    name: string;

    @IsOptional()
    email: string;

    @IsOptional()
    age: number;
}
