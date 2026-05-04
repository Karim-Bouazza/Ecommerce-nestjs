import { IsNotEmpty, IsString } from "class-validator";

export class CreateAuthenticationDto {

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
