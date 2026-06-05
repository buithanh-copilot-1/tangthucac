import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  /** Lấy đánh giá của user hiện tại cho 1 truyện */
  async getMyRating(userId: string, storyId: string) {
    const rating = await this.prisma.rating.findUnique({
      where: { userId_storyId: { userId, storyId } },
    });
    return { score: rating?.score ?? 0 };
  }

  /** Đánh giá / cập nhật đánh giá, rồi tính lại điểm trung bình của truyện */
  async rate(userId: string, storyId: string, score: number) {
    const story = await this.prisma.story.findUnique({ where: { id: storyId } });
    if (!story) throw new NotFoundException('Không tìm thấy truyện');

    await this.prisma.rating.upsert({
      where: { userId_storyId: { userId, storyId } },
      update: { score },
      create: { userId, storyId, score },
    });

    return this.recompute(storyId);
  }

  /** Tính lại rating trung bình + số lượng, lưu vào Story */
  private async recompute(storyId: string) {
    const agg = await this.prisma.rating.aggregate({
      where: { storyId },
      _avg: { score: true },
      _count: true,
    });

    const rating = Math.round((agg._avg.score ?? 0) * 10) / 10;
    const ratingCount = agg._count;

    await this.prisma.story.update({
      where: { id: storyId },
      data: { rating, ratingCount },
    });

    return { rating, ratingCount };
  }
}
