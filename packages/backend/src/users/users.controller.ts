import {
    Controller,
    Get,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    ForbiddenException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get all users (Admin only)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'List of users' })
    async findAll(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
    ) {
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            this.usersService.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.usersService.count(),
        ]);

        return {
            data: users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    @Get('me')
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'Current user profile' })
    async getProfile(@CurrentUser() user: any) {
        const profile = await this.usersService.findById(user.sub);

        if (!profile) {
            throw new ForbiddenException('User not found');
        }

        const { password, ...profileWithoutPassword } = profile;
        return profileWithoutPassword;
    }

    @Put('me')
    @ApiOperation({ summary: 'Update current user profile' })
    @ApiResponse({ status: 200, description: 'Profile updated successfully' })
    async updateProfile(@CurrentUser() user: any, @Body() updateUserDto: UpdateUserDto) {
        const updatedUser = await this.usersService.update(user.sub, updateUserDto);

        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }

    @Get(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get user by ID (Admin only)' })
    @ApiResponse({ status: 200, description: 'User found' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async findOne(@Param('id') id: string) {
        const user = await this.usersService.findById(id);

        if (!user) {
            throw new ForbiddenException('User not found');
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    @Put(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Update user by ID (Admin only)' })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        const updatedUser = await this.usersService.update(id, updateUserDto);

        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Delete user by ID (Super Admin only)' })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    async remove(@Param('id') id: string) {
        return this.usersService.delete(id);
    }
}