import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarksService {
  constructor(private prisma: PrismaService) {}

  getAll(userId: string) {
    return this.prisma.bookmark.findMany({
      where: { userId },
      include: { story: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async add(userId: string, storyId: string) {
    const exists = await this.prisma.bookmark.findUnique({
      where: { userId_storyId: { userId, storyId } },
    });
    if (exists) throw new ConflictException('Truyện đã có trong mục yêu thích');
    return this.prisma.bookmark.create({ data: { userId, storyId }, include: { story: true } });
  }

  async remove(userId: string, storyId: string) {
    const exists = await this.prisma.bookmark.findUnique({
      where: { userId_storyId: { userId, storyId } },
    });
    if (!exists) throw new NotFoundException('Không tìm thấy trong mục yêu thích');
    await this.prisma.bookmark.delete({ where: { userId_storyId: { userId, storyId } } });
    return { message: 'Đã xóa khỏi yêu thích' };
  }
}
