import { BadRequestException, forwardRef, HttpStatus, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Model, Types as MongooseTypes } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from "crypto";
import { generateSecret, GeneratedSecret, totp, Encoding } from '@levminer/speakeasy';
import * as qrcode from 'qrcode';

import { User } from './users.schema';
import { CreateUserDto, UpdateUserDto } from './dtos/users.dto';
import { LoginResponseDto } from '../auth/dtos/login.dto';
import { ApiResponse } from '../common/api-response';
import { ZoneDocument, Zone } from './zone/zone.schema';
import { CreateZoneDto } from './dtos/zones.dto';
import config from '../config';
import { ConfigType } from '@nestjs/config';
import { getCurrentUTCDate } from 'apps/core/utils/getUtcDate';
import { AuthService } from '../auth/auth.service';
import { MailerService } from '../mailer.service';
import { TransporterOptions } from '../interfaces/transporterOptions.interface';

@Injectable()
export class UsersService {
    companyId: string;

    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Zone.name) private zoneModel: Model<ZoneDocument>,
        @Inject(config.KEY) private configService: ConfigType<typeof config>,
        @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService,
    ) { this.companyId = "3423f065-bb88-4cc5-b53a-63290b960c1a" }

    async findAll(filter?: string, value?: string) {
        let filterBy = filter ? { [filter]: value } : {};
        try {
            let users = await this.userModel.find(filterBy).exec();
            if (!users || users.length === 0) {
                throw new InternalServerErrorException({
                    statusCode: 404,
                    message: 'No se encontraron usuarios',
                });
            }
            let usersMap = users.map((user: User) => {
                return {
                    id: user._id.toString(),
                    email: user?.email,
                    phone: user?.phone,
                    name: user?.name,
                    lastname: user?.lastname,
                    role: user?.role,
                    active: user?.active,
                    zoneId: user?.zoneId ? user?.zoneId.toString() : null,
                }
            });
            return ApiResponse.success('Lista de usuarios obtenida con éxito', usersMap);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    async findOne(id: MongooseTypes.ObjectId | string) {
        return this.userModel.findById(id);
    }

    async create(data: CreateUserDto) {
        try {
            const newModel = new this.userModel(data);
            const hashPassword = await bcrypt.hash(newModel.password, 10);
            newModel.password = hashPassword;
            newModel.companyId = this.companyId;
            newModel.zoneId = new MongooseTypes.ObjectId(data.zoneId);

            const model = await newModel.save();
            const modelObject = model.toObject();
            return ApiResponse.success('Usuario creado con éxito', new LoginResponseDto(modelObject), HttpStatus.CREATED);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }

    }

    findByEmail(email: string) {
        return this.userModel.findOne({ email }).exec();
    }

    findById(id: string) {
        return this.userModel.findById({ id }).exec();
    }

    update(id: string, changes: UpdateUserDto) {
        return this.userModel
            .findByIdAndUpdate(id, { $set: changes }, { new: true })
            .exec();
    }

    remove(id: string) {
        return this.userModel.findByIdAndDelete(id);
    }

    async createZone(data: CreateZoneDto) {
        const newModel = new this.zoneModel(data);
        const model = await newModel.save();
        return model;
    }

    async getAllZones() {
        const zones = await this.zoneModel.find().exec();
        if (!zones || zones.length === 0) {
            throw new InternalServerErrorException({
                statusCode: 404,
                message: 'No se encontraron zonas',
            });
        }
        return ApiResponse.success('Lista de zonas obtenida con éxito', zones);
    }

    async getZoneById(id: string) {
        const zone = await this.zoneModel.findById(id).exec();
        if (!zone) {
            throw new InternalServerErrorException({
                statusCode: 404,
                message: 'No se encontraron datos de la zona',
            });
        }
        return ApiResponse.success('Success', zone);
    }

    async getZoneByIdInternal(id: string) {
        const zone = await this.zoneModel.findById(id).exec();
        return zone;
    }

    /**
     * Restablece la contraseña si el token es válido
     */
    async resetPassword(token: string, newPassword: string) {
        const user = await this.userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: getCurrentUTCDate() }, // Verifica que no haya expirado
        });
        if (!user) throw new BadRequestException(
            {
                statusCode: 400,
                message: 'Token de recuperación inválido o caducado',
                error: 'Token de recuperación inválido o caducado',
            }
        );

        let isMatch = await bcrypt.compare(newPassword, user.password);

        if (isMatch) throw new BadRequestException(
            {
                statusCode: 400,
                message: 'La contraseña no puede ser igual a la actual',
                error: 'La contraseña no puede ser igual a la actual',
            }
        );

        // Verificar que el token no haya expirado
        let hasValidToken = this.authService.validateTokenGlobal(token);
        if (!hasValidToken) throw new BadRequestException(
            {
                statusCode: 400,
                message: 'Token de recuperación inválido o caducado',
                error: 'Token de recuperación inválido o caducado',
            }
        );

        // Hashear nueva contraseña
        const hashPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar usuario
        await this.userModel.findByIdAndUpdate(user._id, {
            password: hashPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        });

        return ApiResponse.success('Contraseña restablecida correctamente', null);
    }

    private async generateQrCode(secret: GeneratedSecret): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            qrcode.toDataURL(secret.otpauth_url!, (err, data) => {
                if (err) reject(err);
                resolve(data);
            });
        });
    }

    /**
   * Generate Secret Key
   */
    async generateSecret(userEmail: string) {
        try {
            let user = await this.userModel.findOne({ email: userEmail }).exec();
            if (!user) throw new NotFoundException({
                statusCode: 404,
                message: 'Usuario no encontrado',
                error: 'Usuario no encontrado',
            });
            let secret: GeneratedSecret = generateSecret({ length: 20, name: `Quality backoffice (${userEmail})` });
            let secretBase32 = secret.base32;
            let secretEncrypted = await this.encrypt(secretBase32);
            await this.userModel.findByIdAndUpdate(user._id, { $set: { secret: secretEncrypted, activeOtp: true } });
            let qrcode = await this.generateQrCode(secret);
            return ApiResponse.success(
                'Código QR generado exitosamente.',
                {
                    qrcode
                },
                HttpStatus.CREATED);
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    /**
   * Generate otp para autenticacion de dos pasos
   * @param {String} secretKey
   * @param {String} encoding
   */
    generateOtp(secretKey: string, encoding: Encoding): string {
        try {
            let otp: string = totp({
                secret: secretKey,
                encoding: encoding
            });

            return otp;
        } catch (error) {
            let errorResponse = new Error('Ocurrión un error al generar el otp')
            return String(errorResponse)
        }
    }

    /**
   * encript value for save in database
   * @param {String} value
   */
    async encrypt(value: string): Promise<string | Error> {
        try {
            let iv = Buffer.from(this.configService.iv, "hex");
            let encryptedKey = Buffer.from(this.configService.encryptionKey, "hex");
            const cipher = crypto.createCipheriv("aes-256-cbc", encryptedKey, iv);
            let encrypted = cipher.update(value, "utf-8", "hex");
            encrypted += cipher.final("hex");
            return `${this.configService.iv}:${encrypted}`;
        } catch (error) {
            return new Error('Ocurrió un error al encriptar el valor')
        }
    }

    /**
     * decript value 
     * @param {String} encryptedValue
     */
    async decrypt(encryptedValue: string): Promise<string | Error> {
        try {
            let encryptedKey = Buffer.from(this.configService.encryptionKey, "hex");
            const [iv, encrypted] = encryptedValue.split(":");
            const decipher = crypto.createDecipheriv(
                "aes-256-cbc",
                encryptedKey,
                Buffer.from(iv, "hex")
            );
            let decrypted = decipher.update(encrypted, "hex", "utf-8");
            decrypted += decipher.final("utf-8");
            return decrypted;
        } catch (error) {
            console.log(error);
            return new Error('Ocurrió un error al desencriptar el valor')
        }
    }

    async verifyotp(email: string, otp: string) {
        try {
            let user = await this.userModel.findOne({ email: email }).exec();
            if (!user) throw new NotFoundException({
                statusCode: 404,
                message: 'Usuario no encontrado',
                error: 'Usuario no encontrado',
            });
            if (!user.activeOtp) throw new NotFoundException({
                statusCode: 404,
                message: 'OTP no activado',
                error: 'OTP no activado',
            });
            if (!user.secret) throw new NotFoundException({
                statusCode: 404,
                message: 'Otp no activado',
                error: 'Otp no activado',
            });
            let secret = user.secret;
            let secretDecrypted = await this.decrypt(secret);
            if (secretDecrypted instanceof Error) throw new NotFoundException({
                statusCode: 404,
                message: 'Error al verificar secret',
                error: 'Error al verificar secret',
            });
            let isValid = await this.verifyOtpService(secretDecrypted, otp);
            if (isValid) {
                return ApiResponse.success('Código válido', { isValid: true }, HttpStatus.OK);
            } else {
                return ApiResponse.error('Código inválido', 'OTP incorrecto', HttpStatus.BAD_REQUEST);
            }
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: 500,
                message: 'Error interno del servidor',
                error: error.message || 'Unknown error',
            });
        }
    }

    private async verifyOtpService(secret: string, otp: string) {
        return totp.verify({
            secret,
            encoding: 'base32',
            token: otp,
            window: 1, // Permite un margen de error en tiempo
        });
    }

    /**
    * Genera un token de recuperación y lo almacena temporalmente en la BD
    */
    async requestPasswordReset(email: string) {
        const user = await this.userModel.findOne({ email }).exec();
        if (!user) throw new NotFoundException({
            statusCode: 404,
            message: 'Usuario no encontrado',
            error: 'Usuario no encontrado',
        });

        // Generar un token seguro
        const resetToken = this.authService.generateJwtGlobal(user as User);
        let now = getCurrentUTCDate()
        const expirationTime = new Date(now.getTime() + 15 * 60 * 1000);

        await this.userModel.findByIdAndUpdate(user._id, {
            resetPasswordToken: resetToken,
            resetPasswordExpires: expirationTime,
        });

        let urlResetPassword = `${this.configService.urlBackOffice}${this.configService.pathResetPassword}?token=${resetToken}`;
        let name = user.name.split(' ')[0];
        let template = `<p>Hola ${name},</p><p>Por favor, haga clic en el siguiente enlace para restablecer su contraseña:</p><p><a href="${urlResetPassword}">${urlResetPassword}</a></p>`;
        // Enviar correo con el token
        this.sendMail(
            "Recuperación de contraseña (Backoffice)",
            user.email,
            template,
            false)
            .then(() => {
                console.log('Correo enviado exitosamente');
            })
            .catch(e => console.log(e));

        return ApiResponse.success('Se ha enviado un enlace de recuperación', null);
    }

    async sendMail(
        subject: string,
        recipient: string,
        body: string,
        isAttach: boolean,
        attach?: any,
    ): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                let mailer = new MailerService();
                if (isAttach) {
                    let params: TransporterOptions = {
                        to: [recipient],
                        subject: subject,
                        html: `${body}`,
                        isAttach: true,
                        attachments: attach
                    }
                    await mailer.sendEmail(params);
                    resolve()
                } else {
                    let params: TransporterOptions = {
                        to: [recipient],
                        subject: subject,
                        html: ` ${body} `,
                        isAttach: false
                    }
                    await mailer.sendEmail(params);
                    resolve()
                }
            } catch (error) {
                console.log(error);
                reject(error);
            }
        })
    }
}