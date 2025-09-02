import { Test, TestingModule } from '@nestjs/testing';
import { EventsGateway } from './events.gateway';
import { WsJwtAuthGuard } from '../auth/guards/ws-jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

describe('EventsGateway', () => {
  let gateway: EventsGateway;

  const mockSocket = {
    id: 'socket-id',
    join: jest.fn(),
    leave: jest.fn(),
  };

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsGateway,
        {
          provide: WsJwtAuthGuard,
          useValue: { canActivate: () => true },
        },
        {
          provide: JwtService,
          useValue: { verify: () => ({ sub: 'user-id' }) },
        },
        {
          provide: UsersService,
          useValue: { findById: () => ({ id: 'user-id', isActive: true }) },
        },
      ],
    }).compile();

    gateway = module.get<EventsGateway>(EventsGateway);
    gateway.server = mockServer as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should handle connection', () => {
    const loggerSpy = jest.spyOn(gateway['logger'], 'log');
    gateway.handleConnection(mockSocket as any);
    expect(loggerSpy).toHaveBeenCalledWith('Client connected: socket-id');
  });

  it('should handle disconnect', () => {
    const loggerSpy = jest.spyOn(gateway['logger'], 'log');
    gateway.handleDisconnect(mockSocket as any);
    expect(loggerSpy).toHaveBeenCalledWith('Client disconnected: socket-id');
  });

  it('should handle subscribe', () => {
    const payload = { room: 'test-room' };
    gateway.handleSubscribe(mockSocket as any, payload);
    expect(mockSocket.join).toHaveBeenCalledWith('test-room');
  });

  it('should handle unsubscribe', () => {
    const payload = { room: 'test-room' };
    gateway.handleUnsubscribe(mockSocket as any, payload);
    expect(mockSocket.leave).toHaveBeenCalledWith('test-room');
  });

  it('should broadcast a message to a room', () => {
    const room = 'test-room';
    const event = 'test-event';
    const data = { message: 'test-message' };
    gateway.broadcast(room, event, data);
    expect(mockServer.to).toHaveBeenCalledWith(room);
    expect(mockServer.emit).toHaveBeenCalledWith(event, data);
  });
});
