import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto, UpdateSettingsDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, username: true, displayName: true, givenName: true,
        familyName: true, email: true, emailVerified: true, avatarUrl: true,
        googleId: true, provider: true, isActive: true, createdAt: true, updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    if (dto.username) {
      const taken = await this.prisma.user.findFirst({
        where: { username: { equals: dto.username, mode: 'insensitive' }, NOT: { id } },
      });
      if (taken) throw new ConflictException('Tên người dùng đã tồn tại');
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true, username: true, displayName: true, givenName: true,
        familyName: true, email: true, emailVerified: true, avatarUrl: true,
        googleId: true, provider: true, isActive: true, settings: true,
        createdAt: true, updatedAt: true,
      },
    });
  }

  async getSettings(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { settings: true } });
    return user?.settings ?? null;
  }

  async updateSettings(id: string, dto: UpdateSettingsDto) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { settings: true } });
    const current = (user?.settings as Record<string, any>) ?? {};
    const merged = { ...current, ...dto };
    await this.prisma.user.update({ where: { id }, data: { settings: merged } });
    return merged;
  }
}
