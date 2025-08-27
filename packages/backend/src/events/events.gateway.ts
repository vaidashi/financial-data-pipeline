import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from 'src/auth/guards/ws-jwt-auth.guard';
import { SubscriptionDto } from './dto/subscription.dto';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
@UseGuards(WsJwtAuthGuard)
export class EventsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    private logger: Logger = new Logger('EventsGateway');

    afterInit(server: Server) {
        server.on('connection', (socket: Socket) => {
            this.logger.log(`Client connected: ${socket.id}`);
        });
        // this.logger.log('Initialized!');
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('subscribe')
    handleSubscribe(client: Socket, @MessageBody() payload: SubscriptionDto): void {
        this.logger.log(`Client ${client.id} subscribing to ${payload.room}`);
        client.join(payload.room);
    }

    @SubscribeMessage('unsubscribe')
    handleUnsubscribe(client: Socket, @MessageBody() payload: SubscriptionDto): void {
        this.logger.log(`Client ${client.id} unsubscribing from ${payload.room}`);
        client.leave(payload.room);
    }

    broadcast(room: string, event: string, data: any): void {
        this.server.to(room).emit(event, data);
    }
}