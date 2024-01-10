import { Body, Controller, Get, Post, Render, Request, UseGuards } from '@nestjs/common';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { CreateUserDto, RegisterUserDto } from 'src/users/dto/create-user.dto';

@Controller("auth")
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('login')
    handleLogin(@Request() req) {
        return this.authService.login(req.user);
    }

    //@UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    @Public()
    @Post('register')
    @ResponseMessage("Register a new User")
    registerANewUser(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.registerANewUser(registerUserDto);
    }
}
