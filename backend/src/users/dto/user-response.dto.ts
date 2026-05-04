import { Expose } from 'class-transformer';

export class UserResponseDto {

    @Expose()
    id: number;

    @Expose()
    username: string;

    @Expose()
    email: string;

    @Expose()
    first_name: string;

    @Expose()
    last_name: string;

    @Expose()
    phone_number?: string;

    @Expose()
    province?: string;

    @Expose()
    city?: string;

    constructor(partial: Partial<UserResponseDto>) {
        Object.assign(this, partial);
    }
}