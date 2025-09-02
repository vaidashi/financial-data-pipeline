import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from 'src/auth/guards/ws-jwt-auth.guard';
import { SubscriptionDto } from './dto/subscription.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
@UseGuards(WsJwtAuthGuard)
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private logger: Logger = new Logger('EventsGateway');

  afterInit(server: Server) {
    server.on('connection', (socket: Socket) => {
      this.logger.log(`Client connected: ${socket.id}`);
    });
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubscriptionDto
  ): void {
    if (!client) {
      this.logger.error('Client is undefined in handleSubscribe');
      return;
    }

    this.logger.log(`Client ${client?.id} subscribing to ${payload.room}`);
    client.join(payload.room);
    console.log(`Client ${client.id} joined room: ${payload.room}`);
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubscriptionDto
  ): void {
    if (!client) {
      this.logger.error('Client is undefined in handleUnsubscribe');
      return;
    }

    this.logger.log(`Client ${client.id} unsubscribing from ${payload.room}`);
    client.leave(payload.room);
  }

  broadcast(room: string, event: string, data: any): void {
    this.server.to(room).emit(event, data);
  }

  // todo: keep for now to troubleshoot in near future but eventually remove
  @SubscribeMessage('debug')
  handleDebug(@ConnectedSocket() client: Socket): void {
    if (!client) {
      this.logger.error('Client is undefined in handleDebug');
      return;
    }

    console.log('Debug request received from client:', client.id);

    // Send test event back to client
    client.emit('debug:response', { message: 'Test from server' });

    // Log all connected clients
    console.log('Connected clients:', this.server.sockets.sockets.size);

    // Try sending to the specific client and all clients
    client.emit('test', { targetedMessage: 'Just for you' });
    this.server.emit('broadcast', { broadcastMessage: 'For everyone' });
  }
}
