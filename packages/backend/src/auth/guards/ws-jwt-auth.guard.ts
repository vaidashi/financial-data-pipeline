import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  private logger: Logger = new Logger(WsJwtAuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();

    try {
      const token = this.extractTokenFromHandshake(client);

      if (!token) {
        throw new WsException('Unauthorized');
      }

      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);

      if (!user || !user.isActive) {
        throw new WsException('Unauthorized');
      }

      context.switchToHttp().getRequest().user = user;
    } catch (err) {
      this.logger.error('WebSocket authentication error', err);
      client.emit('error', 'Unauthorized');
      client.disconnect();
      return false;
    }
    return true;
  }

  private extractTokenFromHandshake(client: Socket): string | undefined {
    return client?.handshake?.auth?.token;
  }
}
