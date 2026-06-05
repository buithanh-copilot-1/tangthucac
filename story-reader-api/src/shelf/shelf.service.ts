import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShelfStatus } from '@prisma/client';

@Injectable()
export class ShelfService {
  constructor(private prisma: PrismaService) {}

  getShelf(userId: string, status?: ShelfStatus) {
    return this.prisma.shelfEntry.findMany({
      where: { userId, ...(status && { status }) },
      include: { story: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async upsert(userId: string, storyId: string, status: ShelfStatus) {
    return this.prisma.shelfEntry.upsert({
      where: { userId_storyId: { userId, storyId } },
      update: { status, completedAt: status === 'COMPLETED' ? new Date() : undefined },
      create: { userId, storyId, status },
      include: { story: true },
    });
  }

  async remove(userId: string, storyId: string) {
    const entry = await this.prisma.shelfEntry.findUnique({
      where: { userId_storyId: { userId, storyId } },
    });
    if (!entry) throw new NotFoundException('Không có trong tủ truyện');
    await this.prisma.shelfEntry.delete({ where: { userId_storyId: { userId, storyId } } });
    return { message: 'Đã xóa khỏi tủ truyện' };
  }
}
