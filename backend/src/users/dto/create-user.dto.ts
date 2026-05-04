import { IsEmpty, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {

    @IsNotEmpty()
    @IsString()
    "username": string;

    @IsNotEmpty()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    first_name: string;

    @IsNotEmpty()
    @IsString()
    last_name: string;

    @IsEmpty()
    @IsString()
    phone_number?: string;

    @IsEmpty()
    @IsString()
    province?: string;

    @IsEmpty()
    @IsString()
    city?: string;
}
