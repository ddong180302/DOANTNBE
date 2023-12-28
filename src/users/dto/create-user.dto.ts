import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateUserDto {

    @IsEmail({}, {
        message: "Emali không đúng định dạng!",
    })
    @IsNotEmpty({
        message: "Emali không được để trống!",
    })
    email: string;


    @IsNotEmpty({
        message: "Password không được để trống!",
    })
    password: string;


    name: string;


    address: string;

    // phone: string;
    // age: number;
    // createdAt: Date;
    // updatedAt: Date;
}
