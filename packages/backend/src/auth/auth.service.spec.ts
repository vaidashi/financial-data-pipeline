import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { DatabaseService } from '../database/database.service';
import { UsersService } from '../users/users.service';

import { AuthService } from './auth.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let databaseService: DatabaseService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    password: '$2b$12$hashedpassword',
    firstName: 'Test',
    lastName: 'User',
    role: 'USER' as const,
    isActive: true,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    avatar: null,
    preferences: null,
    lastLoginAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findByUsername: jest.fn(),
            create: jest.fn(),
            updateLastLogin: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: DatabaseService,
          useValue: {
            userSession: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
            portfolio: {
              create: jest.fn(),
            },
            watchlist: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'jwt.secret':
                  return 'test-secret';
                case 'jwt.expiresIn':
                  return '1h';
                case 'jwt.refreshExpiresIn':
                  return '7d';
                case 'BCRYPT_ROUNDS':
                  return 12;
                default:
                  return undefined;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const { password, ...userWithoutPassword } = mockUser;

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual(userWithoutPassword);
    });

    it('should return null if user not found', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(inactiveUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.validateUser('test@example.com', 'password')).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('login', () => {
    it('should return tokens and user info on successful login', async () => {
      const { password, ...userWithoutPassword } = mockUser;
      const mockTokens = { accessToken: 'access-token', refreshToken: 'refresh-token' };

      jest.spyOn(service, 'validateUser').mockResolvedValue(userWithoutPassword);
      jest.spyOn(usersService, 'updateLastLogin').mockResolvedValue(undefined);
      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce(mockTokens.accessToken)
        .mockReturnValueOnce(mockTokens.refreshToken);
      jest.spyOn(databaseService.userSession, 'create').mockResolvedValue({} as any);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result).toEqual({
        user: userWithoutPassword,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = {
        email: 'new@example.com',
        username: 'newuser',
        password: 'password',
        firstName: 'New',
        lastName: 'User',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(usersService, 'findByUsername').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);
      jest.spyOn(databaseService.portfolio, 'create').mockResolvedValue({} as any);
      jest.spyOn(databaseService.watchlist, 'create').mockResolvedValue({} as any);
      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      jest.spyOn(databaseService.userSession, 'create').mockResolvedValue({} as any);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw ConflictException if email already exists', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'existing@example.com',
          username: 'newuser',
          password: 'password',
        })
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if username already exists', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(usersService, 'findByUsername').mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'new@example.com',
          username: 'existinguser',
          password: 'password',
        })
      ).rejects.toThrow(ConflictException);
    });
  });
});
