import { Logger } from '@nestjs/common';
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(Number(process.env.SOCKET_IO_PORT) || 4321, {
  cors: {
    origin: '*'
  },
})
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer()
  private server: Socket;

  private readonly logger = new Logger(WebsocketGateway.name);

  afterInit() {
    this.logger.log("Initialized");
  }

  handleConnection(client: Socket) {
    const userId = client.id;
    this.logger.log(`Client id: ${userId} connected`);
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake?.auth?.userId;
    this.logger.log(`Cliend id:${userId} disconnected`);
  }

  @SubscribeMessage("ping")
  handleMessage(client: Socket, @MessageBody() payload: any) {
    const userId = client.handshake?.auth?.userId;
    this.logger.log(payload);
    this.emitEventToUser(String(userId), 'pong', payload); // broadcast messages
    return payload;
  }

  emitEventToUser(userId: string, evento: string, datos: any) {
    this.server.to(userId).emit(evento, datos);
  }
}