import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterUserDto, UserLoginDto } from 'src/users/dto/create-user.dto';
import { Request, Response } from 'express';
import { IUser } from 'src/users/users.interface';
import { RolesService } from 'src/roles/roles.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller("auth")
export class AuthController {
    constructor(
        private authService: AuthService,
        private rolesService: RolesService
    ) { }

    @Public()
    @ResponseMessage("User login")
    @UseGuards(LocalAuthGuard)
    @UseGuards(ThrottlerGuard)
    @ApiBody({ type: UserLoginDto })
    @Post('login')
    handleLogin(
        @Req() req,
        @Res({ passthrough: true }) response: Response) {
        return this.authService.login(req.user, response);
    }

    @Public()
    @Post('register')
    @ResponseMessage("Register a new User")
    registerANewUser(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.registerANewUser(registerUserDto);
    }

    @Public()
    @Post('confirm')
    @ResponseMessage("Confirm a new account")
    confirmANewUser(
        @Body("email") email: string,
        @Body("_id") _id: string,
        @Body("codeConfirm") codeConfirm: string,
    ) {
        return this.authService.confirmANewUser(email, _id, codeConfirm);
    }

    @Public()
    @Post('reset')
    @ResponseMessage("Thay đổi mật khẩu thành công!")
    resetPassword(
        @Body("_id") _id: string,
        @Body("email") email: string,
        @Body("password") password: string,
    ) {
        return this.authService.resetPassword(_id, email, password);
    }

    @ResponseMessage("Get user by email")
    @Post('by-email')
    @Public()
    async handleGetUserByEmail(@Body("email") email: string) {
        return this.authService.handleGetUserByEmail(email);
    }


    @ResponseMessage("Get user information")
    @Get('account')
    async handleGetAccount(@User() user: IUser) {
        const temp = await this.rolesService.findOne(user.role._id) as any;
        user.permissions = temp.permissions;
        return { user }
    }

    @Public()
    @ResponseMessage("Get user by refresh token")
    @Get('refresh')
    handleRefreshToken(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response
    ) {
        const refreshToken = request.cookies["refresh_token"];
        return this.authService.processNewToken(refreshToken, response);
    }

    @ResponseMessage("Logout User")
    @Post('logout')
    handleLogout(
        @User() user: IUser,
        @Res({ passthrough: true }) response: Response
    ) {
        return this.authService.processLogout(user, response);
    }
}
