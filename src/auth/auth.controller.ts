import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Request, Response } from 'express';
import { IUser } from 'src/users/users.interface';

@Controller("auth")
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    @Public()
    @ResponseMessage("User login")
    @UseGuards(LocalAuthGuard)
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

    @ResponseMessage("Get user information")
    @Get('account')
    handleGetAccount(@User() user: IUser) {
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
}
