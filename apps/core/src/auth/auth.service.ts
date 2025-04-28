import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { User } from '../users/users.schema';
import { PayloadToken } from './models/token.model';
import { LoginResponseDto } from './dtos/login.dto';
import { ApiResponse } from '../common/api-response';

@Injectable()
export class AuthService {

    constructor(
        @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) { }

    async validateUser(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                return user;
            }
        }
        return null;
    }

    generateJwtGlobal(user: User): string {
        const payload: PayloadToken = { sub: user._id.toString(), role: user.role, companyId: user.companyId };
        return this.jwtService.sign(payload);
    }

    generateJwt(user: User) {
        const payload: PayloadToken = { sub: user.id, role: user.role, companyId: user.companyId };
        return ApiResponse.success('Login exitoso', { access_token: this.jwtService.sign(payload), user: new LoginResponseDto(user) }, HttpStatus.OK);
    }

    validateToken(token: string) {
        try {
            const decoded = this.jwtService.verify(token);
            return ApiResponse.success('token validado', decoded, 200);
        } catch (error) {
            return ApiResponse.error('token invalidado', error, 401);
        }
    }

    validateTokenGlobal(token: string): boolean {
        try {
            this.jwtService.verify(token);
            return true;
        } catch (error) {
            return false;
        }
    }
}
