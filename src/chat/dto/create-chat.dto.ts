import { IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateChatDto {
    @IsNotEmpty({ message: "firstId không được để trống!" })
    firstId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: "firstId không được để trống!" })
    secondId: mongoose.Schema.Types.ObjectId;
}
