import { IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateSkillDto {
    @IsNotEmpty({ message: "Skill không được để trống!" })
    name: string;
}
