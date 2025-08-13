import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';

import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    try {
      const user = await this.databaseService.user.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log(`User created: ${user.email}`);
      return user;
    } catch (error) {
      this.logger.error('Error creating user:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    return this.databaseService.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.databaseService.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.databaseService.user.findUnique({
      where: { username },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.databaseService.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.databaseService.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;

    const queryParams: any = {
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        password: false,
      },
    };

    if (skip !== undefined) queryParams.skip = skip;
    if (take !== undefined) queryParams.take = take;
    if (cursor !== undefined) queryParams.cursor = cursor;
    if (where !== undefined) queryParams.where = where;
    if (orderBy !== undefined) queryParams.orderBy = orderBy;

    return this.databaseService.user.findMany(queryParams) as Promise<User[]>;
  }

  async delete(id: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.databaseService.user.delete({
      where: { id },
    });
  }

  async count(where?: Prisma.UserWhereInput): Promise<number> {
    const countParams: any = {};

    if (where !== undefined) countParams.where = where;

    return this.databaseService.user.count(countParams);
  }
}
