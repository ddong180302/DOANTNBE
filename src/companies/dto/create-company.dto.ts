
import { IsNotEmpty } from "class-validator";

export class CreateCompanyDto {


    @IsNotEmpty({
        message: "Emali không được để trống!",
    })
    name: string;


    @IsNotEmpty({
        message: "Password không được để trống!",
    })
    address: string;

    @IsNotEmpty({
        message: "Description không được để trống!",
    })
    description: string;


    //address: string;

    // phone: string;
    // age: number;
    // createdAt: Date;
    // updatedAt: Date;
}
