import { IsEmail, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateChatDto {
    @IsNotEmpty({ message: "firstId không được để trống!" })
    firstId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: "firstId không được để trống!" })
    secondId: mongoose.Schema.Types.ObjectId;

    // @IsNotEmpty({ message: "Name không được để trống!" })
    // firstName: string;

    // @IsEmail({}, { message: "Email không đúng định dạng!" })
    // @IsNotEmpty({ message: "Email không được để trống!" })
    // firstMail: string;

    // @IsNotEmpty({ message: "Name không được để trống!" })
    // secondName: string;

    // @IsEmail({}, { message: "Email không đúng định dạng!" })
    // @IsNotEmpty({ message: "Email không được để trống!" })
    // secondEemail: string;
}
