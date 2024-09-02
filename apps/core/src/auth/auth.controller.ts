import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { User } from '../users/users.schema';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    
    @UseGuards(AuthGuard('local'))
    @Post('login')
    login(@Req() req: Request) {
        const user = req.user as User;
        return this.authService.generateJwt(user);
    }
}