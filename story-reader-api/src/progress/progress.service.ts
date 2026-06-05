import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertProgressDto } from './dto/upsert-progress.dto';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  getAll(userId: string) {
    return this.prisma.readingProgress.findMany({
      where: { userId },
      include: { story: true, chapter: { select: { number: true, title: true } } },
      orderBy: { lastRead: 'desc' },
    });
  }

  getOne(userId: string, storyId: string) {
    return this.prisma.readingProgress.findUnique({
      where: { userId_storyId: { userId, storyId } },
      include: { story: true },
    });
  }

  async upsert(userId: string, dto: UpsertProgressDto) {
    return this.prisma.readingProgress.upsert({
      where: { userId_storyId: { userId, storyId: dto.storyId } },
      update: {
        chapterId: dto.chapterId,
        chapterNumber: dto.chapterNumber,
        scrollPosition: dto.scrollPosition,
        lastRead: new Date(),
      },
      create: {
        userId,
        storyId: dto.storyId,
        chapterId: dto.chapterId,
        chapterNumber: dto.chapterNumber,
        scrollPosition: dto.scrollPosition,
      },
    });
  }
}
