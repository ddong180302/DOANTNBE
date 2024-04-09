import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto, CreateUserHrDto } from './create-user.dto';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateUserDto extends OmitType(CreateUserDto, ['password'] as const) {
    @IsNotEmpty({ message: "_id không được để trống!" })
    _id: string;
}

export class UpdateInforUserDto {
    @IsNotEmpty({ message: "_id không được để trống!" })
    _id: string;

    @IsNotEmpty({ message: 'Email không được để trống!' })
    @IsEmail({}, { message: 'Email không hợp lệ!' })
    email: string;

    @IsNotEmpty({ message: 'Tên không được để trống!' })
    name: string;

    @IsNotEmpty({ message: 'Tuổi không được để trống!' })
    age: number;

    @IsNotEmpty({ message: 'Giới tính không được để trống!' })
    gender: string;

    @IsNotEmpty({ message: 'Địa chỉ không được để trống!' })
    address: string;

    @IsNotEmpty({ message: 'Số điện thoại không được để trống!' })
    phone: string;
}


export class UpdateUserHrDto extends OmitType(CreateUserHrDto, ['password'] as const) {
    @IsNotEmpty({ message: "_id không được để trống!" })
    _id: string;
}

