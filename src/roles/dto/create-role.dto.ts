import { IsArray, IsBoolean, IsMongoId, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateRoleDto {
    @IsNotEmpty({ message: "Email không được để trống!" })
    name: string;

    @IsNotEmpty({ message: "description không được để trống!" })
    description: string;

    @IsNotEmpty({ message: "isActive không được để trống!" })
    @IsBoolean({ message: "isActive có giá trị là boolean!" })
    isActive: string;

    @IsNotEmpty({ message: "permissions không được để trống!" })
    @IsMongoId({ message: "permissions là id mongo!" })
    @IsArray({ message: "permissions có định dạng là array!" })
    permissions: mongoose.Schema.Types.ObjectId[];
}
