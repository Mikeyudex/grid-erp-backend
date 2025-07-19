import { Module } from '@nestjs/common';
import { UserGateway } from './user.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSocket, UserSocketSchema } from '../schemas/userSocket.schema';
import { User, UserSchema } from '../users/users.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: UserSocket.name, schema: UserSocketSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    providers: [UserGateway],
    exports: [UserGateway],
})
export class UserGatewayModule { }