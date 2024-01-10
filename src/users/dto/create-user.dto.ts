import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested } from "class-validator";
import mongoose from "mongoose";

class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;
}

export class CreateUserDto {

    @IsNotEmpty({ message: "Name không được để trống!" })
    name: string;

    @IsEmail({}, { message: "Emali không đúng định dạng!" })
    @IsNotEmpty({ message: "Emali không được để trống!" })
    email: string;

    @IsNotEmpty({ message: "Password không được để trống!" })
    password: string;

    @IsNotEmpty({ message: "Age không được để trống!" })
    age: number;

    @IsNotEmpty({ message: "Gender không được để trống!" })
    gender: string;

    @IsNotEmpty({ message: "Address không được để trống!" })
    address: string;

    @IsNotEmpty({ message: "Phone không được để trống!" })
    phone: string;

    @IsNotEmpty({ message: "Role không được để trống!" })
    role: string;

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;

}


export class RegisterUserDto {

    @IsNotEmpty({ message: "Name không được để trống!" })
    name: string;

    @IsEmail({}, { message: "Emali không đúng định dạng!" })
    @IsNotEmpty({ message: "Emali không được để trống!" })
    email: string;

    @IsNotEmpty({ message: "Password không được để trống!" })
    password: string;

    @IsNotEmpty({ message: "Age không được để trống!" })
    age: number;

    @IsNotEmpty({ message: "Gender không được để trống!" })
    gender: string;

    @IsNotEmpty({ message: "Address không được để trống!" })
    address: string;

    @IsNotEmpty({ message: "Phone không được để trống!" })
    phone: string;

}