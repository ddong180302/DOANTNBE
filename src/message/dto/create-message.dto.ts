import { IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateMessageDto {
    @IsNotEmpty({ message: "chatId không được để trống!" })
    chatId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: "senderId không được để trống!" })
    senderId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: "text không được để trống!" })
    text: string;
}
