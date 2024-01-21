import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class CreateSubscriberDto {

    @IsNotEmpty({ message: "Email không được để trống!" })
    email: string;

    @IsNotEmpty({ message: "Name không được để trống!" })
    name: string;

    @IsArray({ message: "Skills có định dạng là array!" })
    @IsNotEmpty({ message: "Skills không được để trống!" })
    @IsString({ each: true, message: "Skills có định dạng là string!" })
    skills: string[];
}
