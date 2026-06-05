import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryStoriesDto } from './dto/query-stories.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class StoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryStoriesDto) {
    const { q, genre, status, page = 1, limit = 20, sort = 'views' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.StoryWhereInput = {
      ...(genre && { genre }),
      ...(status && { status }),
      ...(q && {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { author: { contains: q, mode: 'insensitive' } },
          { tags: { has: q } },
        ],
      }),
    };

    const orderBy: Prisma.StoryOrderByWithRelationInput =
      sort === 'rating' ? { updatedAt: 'desc' } : { [sort]: 'desc' };

    const [stories, total] = await Promise.all([
      this.prisma.story.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.story.count({ where }),
    ]);

    return {
      data: stories,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findFeatured() {
    return this.prisma.story.findMany({
      where: { isFeatured: true },
      orderBy: { views: 'desc' },
      take: 10,
    });
  }

  async findHot() {
    return this.prisma.story.findMany({
      where: { isHot: true },
      orderBy: { views: 'desc' },
      take: 10,
    });
  }

  async findOne(id: string) {
    const story = await this.prisma.story.findUnique({ where: { id } });
    if (!story) throw new NotFoundException('Không tìm thấy truyện');
    return story;
  }

  async findChapters(storyId: string) {
    await this.findOne(storyId);
    return this.prisma.chapter.findMany({
      where: { storyId },
      orderBy: { number: 'asc' },
      select: { id: true, storyId: true, number: true, title: true, wordCount: true, publishedAt: true },
    });
  }

  async findChapter(storyId: string, number: number) {
    await this.findOne(storyId);
    const chapter = await this.prisma.chapter.findUnique({
      where: { storyId_number: { storyId, number } },
    });
    if (!chapter) throw new NotFoundException('Không tìm thấy chương');
    // Tăng views
    await this.prisma.story.update({ where: { id: storyId }, data: { views: { increment: 1 } } });
    return chapter;
  }
}
