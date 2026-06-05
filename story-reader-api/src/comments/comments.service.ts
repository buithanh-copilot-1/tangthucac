import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

const userSelect = {
  id: true, username: true, displayName: true, avatarUrl: true,
};

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  /** Lấy comment gốc + replies, mới nhất trước */
  async list(storyId: string) {
    const comments = await this.prisma.comment.findMany({
      where: { storyId, parentId: null },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: userSelect },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: { user: { select: userSelect } },
        },
      },
    });
    return comments;
  }

  async count(storyId: string) {
    const total = await this.prisma.comment.count({ where: { storyId } });
    return { total };
  }

  async create(userId: string, storyId: string, dto: CreateCommentDto) {
    const story = await this.prisma.story.findUnique({ where: { id: storyId } });
    if (!story) throw new NotFoundException('Không tìm thấy truyện');

    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('Không tìm thấy bình luận gốc');
    }

    return this.prisma.comment.create({
      data: { userId, storyId, content: dto.content, parentId: dto.parentId ?? null },
      include: { user: { select: userSelect }, replies: true },
    });
  }

  async remove(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Không tìm thấy bình luận');
    if (comment.userId !== userId) throw new ForbiddenException('Không thể xóa bình luận của người khác');
    await this.prisma.comment.delete({ where: { id: commentId } });
    return { message: 'Đã xóa bình luận' };
  }
}
