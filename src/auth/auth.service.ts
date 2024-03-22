import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { USER_ROLE } from 'src/databases/sample';
import { RolesService } from 'src/roles/roles.service';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
        @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,
        private readonly usersService: UsersService,
        private readonly rolesService: RolesService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private mailerService: MailerService,
    ) { }

    getHashPassword = (password: string) => {
        const salt = genSaltSync(10);
        const hash = hashSync(password, salt);
        return hash;
    }

    isValidPassword = (password: string, hash: string) => {
        return compareSync(password, hash); //false
    }

    generateConfirmationCode = () => {
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += Math.floor(Math.random() * 10); // Thêm một số ngẫu nhiên từ 0 đến 9 vào chuỗi
        }
        return code;
    }



    async registerANewUser(registerUserDto: RegisterUserDto) {
        const { email, password, name, age, gender, address, phone } = registerUserDto;
        const hashPassword = this.getHashPassword(password);
        const checkUserEmail = await this.userModel.findOne({ email })
        if (checkUserEmail) {
            throw new BadRequestException("Email đã tồn tại vui lòng sử dụng email khác để đăng ký!");
        }

        // Sử dụng hàm để tạo ra một confirmation code mới
        const confirmationCode = this.generateConfirmationCode();

        await this.mailerService.sendMail({
            to: email,
            from: '"Nice App" <support@example.com>',
            subject: 'Welcome to Nice App! Confirm your Email',
            template: "sign",
            context: {
                receiver: email, // Gửi đến địa chỉ email của người dùng mới
                confirmationCode: confirmationCode // Mã code xác nhận
            }
        });

        //fetch user role
        const userRole = await this.roleModel.findOne({ name: USER_ROLE });

        let register = await this.userModel.create({
            password: hashPassword,
            codeConfirm: confirmationCode,
            isActive: false,
            email,
            name,
            age,
            gender,
            address,
            phone,
            role: userRole?._id
        })
        return register;
    }

    async confirmANewUser(email: string, _id: string, codeConfirm: string) {
        const checkUser = await this.userModel.findOne({ _id });
        if (checkUser?.isActive === false) {
            if (checkUser?.codeConfirm !== codeConfirm) {
                throw new BadRequestException("Mã xác nhận không hợp lệ, vui lòng nhập lại!");
            } else {
                let confirm = await this.userModel.updateOne({ _id: _id }, {
                    isActive: true,
                    codeConfirm: "",
                    updatedBy: {
                        _id: _id,
                        email: email
                    }
                });
                return confirm;
            }
        }
    }

    async handleGetUserByEmail(email: string) {
        const checkUserEmail = await this.userModel.findOne({ email }, { password: 0 })
        if (!checkUserEmail) {
            throw new BadRequestException("Email không tồn tại vui lòng đăng ký!");
        }

        // Sử dụng hàm để tạo ra một confirmation code mới
        const confirmationCode = this.generateConfirmationCode();

        await this.mailerService.sendMail({
            to: email,
            from: '"Nice App" <support@example.com>',
            subject: 'Chào mừng bạn đến với Nice App! Xác nhận email của bạn',
            template: "sign",
            context: {
                receiver: email, // Gửi đến địa chỉ email của người dùng mới
                confirmationCode: confirmationCode // Mã code xác nhận
            }
        });

        await this.userModel.updateOne({ email: email }, {
            isActive: false,
            codeConfirm: confirmationCode,

        });

        return checkUserEmail;
    }


    async resetPassword(_id: string, email: string, password: string) {
        const hashPassword = this.getHashPassword(password);
        const checkUserEmail = await this.userModel.findOne({ email })
        if (!checkUserEmail) {
            throw new BadRequestException("Email chưa được đăng ký trong hệ thống, vui lòng nhập email khác!");
        }

        let reset = await this.userModel.updateOne({ _id: _id }, {
            password: hashPassword,
            updatedBy: {
                _id: _id,
                email: email
            }
        });
        return reset;
    }

    //username và password là hai tham số mà thư viện passport ném về
    async validateUser(username: string, pass: string): Promise<any> {

        const user = await this.usersService.findOneByUserName(username);
        if (user) {
            const isValid = this.usersService.isValidPassword(pass, user.password)
            if (isValid === true) {

                //fetch user role
                const userRole = user.role as unknown as { _id: string; name: string }
                const temp = await this.rolesService.findOne(userRole._id);

                const objUser = {
                    ...user.toObject(),
                    permissions: temp?.permissions ?? []
                }
                return objUser;
            }
        }
        return null;
    }

    async login(user: IUser, response: Response) {
        const { _id, name, email, role, permissions } = user;
        const checkUser = await this.userModel.findOne({ _id });
        if (checkUser?.isActive === false) {
            throw new BadRequestException("Vui lòng xác thực tài khoản trước khi đăng nhập!");
        }
        const payload = {
            sub: "token login",
            iss: "from server",
            _id,
            name,
            email,
            role
        };
        const refresh_token = this.createRefreshToken(payload);

        // update user with refresh token
        await this.usersService.updateUserToken(refresh_token, _id);

        // set refresh_token as cookies
        response.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPRISE'))
        });

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                _id,
                name,
                email,
                role,
                permissions
            }
        };
    }

    createRefreshToken = (payload: any) => {
        const refresh_token = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: ms(this.configService.get<string>('JWT_REFRESH_EXPRISE')) / 1000
        })
        return refresh_token;
    }

    processNewToken = async (refreshToken: string, response: Response) => {
        try {
            this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET')
            })

            let user = await this.usersService.findUserByToken(refreshToken);

            if (user) {
                //update refresh token
                const { _id, name, email, role } = user;
                const payload = {
                    sub: "token login",
                    iss: "from server",
                    _id,
                    name,
                    email,
                    role
                };
                const refresh_token = this.createRefreshToken(payload);

                // update user with refresh token
                await this.usersService.updateUserToken(refresh_token, _id.toString());

                //fetch user role
                const userRole = user.role as unknown as { _id: string; name: string }
                const temp = await this.rolesService.findOne(userRole._id);

                // set refresh_token as cookies
                response.clearCookie("refresh_token");

                response.cookie('refresh_token', refresh_token, {
                    httpOnly: true,
                    maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPRISE'))
                });

                return {
                    access_token: this.jwtService.sign(payload),
                    user: {
                        _id,
                        name,
                        email,
                        role,
                        permissions: temp?.permissions ?? []
                    }
                };
            } else {
                throw new BadRequestException("Refresh token không hợp lệ, vui lòng login!");
            }
        } catch (error) {
            throw new BadRequestException("Refresh token không hợp lệ, vui lòng login!");
        }
    }


    processLogout = async (user: IUser, response: Response) => {
        try {
            if (user) {
                await this.usersService.updateUserToken("", user._id);
                response.clearCookie("refresh_token");
                return "ok";
            } else {
                throw new BadRequestException("Refresh token không hợp lệ, vui lòng login!")
            }
        } catch (error) {
            throw new BadRequestException("Refresh token không hợp lệ, vui lòng login!");
        }
    }
}
