import { InjectModel } from '@nestjs/mongoose';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserSocket, UserSocketDocument } from '../schemas/userSocket.schema';
import { User as ErpUser } from '../users/users.schema';
import { Model, Types } from 'mongoose';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'online' | 'offline';
  avatar: string;
  socketId: string;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/',
  path: '/socket.io',
})
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectModel(UserSocket.name)
    private readonly userSocketModel: Model<UserSocketDocument>,
    @InjectModel(ErpUser.name)
    private readonly backOfficeUserModel: Model<ErpUser>,
  ) { }

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);

    let userSocket: any = await this.userSocketModel.findOne({ socketId: client.id }).exec();
    if (!userSocket) return;

    userSocket.status = 'offline';
    await userSocket.save();

    this.server.emit('user_disconnected', {
      userId: userSocket.userId?._id,
    });
  }

  @SubscribeMessage('get_connected_users')
  async handleGetConnectedUsers(@ConnectedSocket() client: Socket) {
    try {
      const users: any = await this.userSocketModel.find().populate('userId').exec();
      client.emit('users_list', {
        users: users.map((userSocket: any) => ({
          id: userSocket.userId?._id,
          name: userSocket.userId?.name,
          email: userSocket.userId?.email,
          role: userSocket?.role,
          status: userSocket.status,
          avatar: userSocket.userId?.avatar || '',
          socketId: userSocket.socketId,
        })),
      });
    } catch (error) {
      console.error('Error obteniendo usuarios conectados:', error);
      client.emit('error', { message: 'Error al obtener usuarios conectados' });
    }
  }

  @SubscribeMessage('change_status')
  async handleChangeStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { status: 'online' | 'offline' },
  ) {
    try {
      const userSocket: any = await this.userSocketModel.findOne({ socketId: client.id }).exec();
      if (!userSocket) return;

      userSocket.status = body.status;
      await userSocket.save();

      this.server.emit('user_status_changed', {
        userId: userSocket.userId?._id,
        status: userSocket.status,
      });
    } catch (error) {
      console.error('Error cambiando estado del usuario:', error);
      client.emit('error', { message: 'Error al cambiar estado del usuario' });
    }
  }

  @SubscribeMessage('register_user')
  async handleRegisterUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() userData: Partial<User>,
  ) {

    if (!userData.id) return;

    try {
      const backOfficeUser: any = await this.backOfficeUserModel.findById(userData.id)
        //.populate('role')
        .exec();
      if (!backOfficeUser) return;

      let userSocket = await this.userSocketModel.findOne({ userId: userData.id }).exec();
      if (userSocket) {
        userSocket.socketId = client.id;
        userSocket.status = 'online';
      } else {
        userSocket = new this.userSocketModel({
          socketId: client.id,
          status: 'online',
          userId: backOfficeUser._id,
        });
      }

      await userSocket.save();

      this.server.emit('user_connected', {
        id: backOfficeUser._id,
        userId: backOfficeUser._id,
        name: backOfficeUser.name,
        email: backOfficeUser.email,
        role: backOfficeUser?.role?.name,
        status: 'online',
        avatar: backOfficeUser?.avatar || '',
        socketId: client.id,
      });
    } catch (error) {
      console.error('Error registrando usuario:', error);
      client.emit('error', { message: 'Error al registrar usuario' });
    }
  }

  @SubscribeMessage('unregister_user')
  async handleUnregisterUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: string,
  ) {
    try {
      let castedUserId = new Types.ObjectId(userId);
      await this.userSocketModel.deleteOne({ userId: castedUserId }).exec();
      this.server.emit('user_disconnected', {
        userId,
      });
    } catch (error) {
      console.error('Error al desregistrar usuario:', error);
      client.emit('error', { message: 'Error al desregistrar usuario' });
    }
  }
}
