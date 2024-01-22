import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, ValidateNested } from "class-validator";
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
    @IsMongoId({ message: "role có định dạng là mongo ID" })
    role: mongoose.Schema.Types.ObjectId;

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

export class UserLoginDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'dong@gmail.com', description: 'username' })
    readonly username: string;
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '123456',
        description: 'password',
    })
    readonly password: string;
}
