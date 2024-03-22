
import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class CreateCompanyDto {
    @IsNotEmpty({
        message: "Name không được để trống!",
    })
    name: string;

    @IsNotEmpty({
        message: "Address không được để trống!",
    })
    address: string;

    @IsNotEmpty({
        message: "CompanyType không được để trống!",
    })
    companyType: string;

    @IsNotEmpty({
        message: "CompanySize không được để trống!",
    })
    companySize: string;

    @IsNotEmpty({
        message: "Country không được để trống!",
    })
    country: string;

    @IsNotEmpty({
        message: "WorkingDays không được để trống!",
    })
    workingDays: string;

    @IsNotEmpty({
        message: "OvertimePolicy không được để trống!",
    })
    overtimePolicy: string;

    @IsArray({ message: "Ourkeyskills có định dạng là array!" })
    @IsNotEmpty({ message: "Ourkeyskills không được để trống!" })
    @IsString({ each: true, message: "Ourkeyskills có định dạng là string!" })
    ourkeyskills: string[];

    @IsNotEmpty({
        message: "Description không được để trống!",
    })
    description: string;

    @IsNotEmpty({ message: "Logo không được để trống!" })
    logo: string;
}
