import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let databaseService: DatabaseService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedpassword',
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
        UsersService,
        {
          provide: DatabaseService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      jest.spyOn(databaseService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.findById('1');

      expect(result).toEqual(mockUser);
      expect(databaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null if user not found', async () => {
      jest.spyOn(databaseService.user, 'findUnique').mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return user', async () => {
      const updateData = { firstName: 'Updated' };
      const updatedUser = { ...mockUser, ...updateData };

      jest.spyOn(service, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(databaseService.user, 'update').mockResolvedValue(updatedUser);

      const result = await service.update('1', updateData);

      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(null);

      await expect(service.update('nonexistent', { firstName: 'Updated' })).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
