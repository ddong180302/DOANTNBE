import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, ValidateNested } from "class-validator";
import mongoose from "mongoose";


class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    logo: string;
}

export class CreateJobDto {
    @IsNotEmpty({ message: "Name không được để trống!" })
    name: string;

    @IsArray({ message: "Skills có định dạng là array!" })
    @IsNotEmpty({ message: "Skills không được để trống!" })
    @IsString({ each: true, message: "Skills có định dạng là string!" })
    skills: string[];

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;

    @IsNotEmpty({ message: "Location không được để trống!" })
    location: string;

    @IsNotEmpty({ message: "Salary không được để trống!" })
    salary: number;

    @IsNotEmpty({ message: "Quantity không được để trống!" })
    quantity: number;

    @IsNotEmpty({ message: "Level không được để trống!" })
    level: string;

    @IsNotEmpty({ message: "Description không được để trống!" })
    description: string;

    @Transform(({ value }) => new Date(value))
    @IsNotEmpty({ message: "Start date không được để trống!" })
    @IsDate({ message: "startDate có định dạng là Date" })
    startDate: Date;

    @Transform(({ value }) => new Date(value))
    @IsNotEmpty({ message: "End date không được để trống!" })
    @IsDate({ message: "endDate có định dạng là Date" })
    endDate: Date;

    @IsBoolean({ message: "IsActive có định dạng là booblean" })
    @IsNotEmpty({ message: "IsActive không được để trống!" })
    isActive: boolean
}
