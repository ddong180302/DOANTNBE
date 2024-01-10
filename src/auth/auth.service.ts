import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
        private readonly usersService: UsersService,
        private jwtService: JwtService
    ) { }

    getHashPassword = (password: string) => {
        const salt = genSaltSync(10);
        const hash = hashSync(password, salt);
        return hash;
    }

    isValidPassword = (password: string, hash: string) => {
        return compareSync(password, hash); //false
    }

    async registerANewUser(registerUserDto: RegisterUserDto) {
        const { email, password, name, age, gender, address, phone } = registerUserDto;
        const hashPassword = this.getHashPassword(password);
        const checkUserEmail = await this.userModel.findOne({ email })
        if (checkUserEmail) {
            throw new BadRequestException("Email đã tồn tại vui lòng sử dụng email khác để đăng ký!");
        }
        let register = await this.userModel.create({
            password: hashPassword,
            email,
            name,
            age,
            gender,
            address,
            phone,
            role: "USER"
        })
        return {
            _id: register?._id,
            createdAt: register?.createdAt
        };
    }

    //username và password là hai tham số mà thư viện passport ném về
    async validateUser(username: string, pass: string): Promise<any> {

        const user = await this.usersService.findOneByUserName(username);
        if (user) {
            const isValid = this.usersService.isValidPassword(pass, user.password)
            if (isValid === true) {
                return user
            }
        }
        return null;
    }

    async login(user: IUser) {
        const { _id, name, email, role } = user;
        const payload = {
            sub: "token login",
            iss: "from server",
            _id,
            name,
            email,
            role
        };
        return {
            access_token: this.jwtService.sign(payload),
            _id,
            name,
            email,
            role
        };
    }
}
