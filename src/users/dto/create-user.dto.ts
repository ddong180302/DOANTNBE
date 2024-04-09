import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsEmail, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, Length, MaxLength, MinLength, ValidateNested } from "class-validator";
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

    @IsEmail({}, { message: "Email không đúng định dạng!" })
    @IsNotEmpty({ message: "Email không được để trống!" })
    email: string;

    codeConfirm: string;

    @IsNotEmpty({ message: "Password không được để trống!" })
    @MinLength(6, { message: "Độ dài mật khẩu phải dài hơn 6 ký tự!" })
    @MaxLength(12, { message: "Độ dài mật khẩu phải ngắn hơn 12 ký tự!" })
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

    isActive: boolean;

}

export class CreateUserHrDto {

    @IsNotEmpty({ message: "Name không được để trống!" })
    name: string;

    @IsEmail({}, { message: "Email không đúng định dạng!" })
    @IsNotEmpty({ message: "Email không được để trống!" })
    email: string;

    codeConfirm: string;

    @IsNotEmpty({ message: "Password không được để trống!" })
    @MinLength(6, { message: "Độ dài mật khẩu phải dài hơn 6 ký tự!" })
    @MaxLength(12, { message: "Độ dài mật khẩu phải ngắn hơn 12 ký tự!" })
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
    company?: Company;

    isActive: boolean;

}


export class RegisterUserDto {

    @IsNotEmpty({ message: "Name không được để trống!" })
    name: string;

    @IsEmail({}, { message: "Email không đúng định dạng!" })
    @IsNotEmpty({ message: "Email không được để trống!" })
    email: string;

    @IsNotEmpty({ message: "Password không được để trống!" })
    @MinLength(6, { message: "Độ dài mật khẩu phải dài hơn 6 ký tự!" })
    @MaxLength(12, { message: "Độ dài mật khẩu phải ngắn hơn 12 ký tự!" })
    password: string;

    @IsNotEmpty({ message: "Age không được để trống!" })
    age: number;

    @IsNotEmpty({ message: "Gender không được để trống!" })
    gender: string;

    @IsNotEmpty({ message: "Address không được để trống!" })
    address: string;

    @IsNotEmpty({ message: "Phone không được để trống!" })
    phone: string;

    isActive: boolean;

    codeConfirm: string;

}

export class UserLoginDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'trandangdong18032002@gmail.com', description: 'username' })
    readonly username: string;
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '123456',
        description: 'password',
    })
    readonly password: string;
}

export function hasCompany(dto: CreateUserDto | RegisterUserDto): boolean {
    return Company !== undefined;
}