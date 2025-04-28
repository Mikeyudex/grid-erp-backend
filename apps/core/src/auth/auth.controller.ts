import { BadRequestException, Controller, Post, Req, UseGuards } from '@nestjs/common';
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

    @Post('validatetoken')
    validatetoken(@Req() req: any | Request) {
        const token = req?.headers?.authorization;
        if (!token) throw new BadRequestException({
            statusCode: 400,
            message: 'Token no encontrado',
            error: 'Token no encontrado',
        });

        if (!token.startsWith('Bearer ')) throw new BadRequestException({
            statusCode: 400,
            message: 'Token no válido',
            error: 'Token no válido',
        });

        return this.authService.validateToken(token.split(' ')[1]);
    }
}