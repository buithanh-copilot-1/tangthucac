import { describe, expect, it, jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { RatingsService } from './ratings.service';

describe('RatingsService', () => {
  function createService() {
    const prisma = {
      story: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      rating: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        aggregate: jest.fn(),
      },
    };

    return {
      prisma,
      service: new RatingsService(prisma as any),
    };
  }

  it('upserts a rating and returns the recomputed average', async () => {
    const { prisma, service } = createService();
    (prisma.story.findUnique as any).mockResolvedValue({ id: 'story-1' });
    (prisma.rating.aggregate as any).mockResolvedValue({ _avg: { score: 4.26 }, _count: 3 });
    (prisma.story.update as any).mockResolvedValue({ id: 'story-1', rating: 4.3, ratingCount: 3 });

    await expect(service.rate('user-1', 'story-1', 5)).resolves.toEqual({
      rating: 4.3,
      ratingCount: 3,
    });

    expect(prisma.rating.upsert).toHaveBeenCalledWith({
      where: { userId_storyId: { userId: 'user-1', storyId: 'story-1' } },
      update: { score: 5 },
      create: { userId: 'user-1', storyId: 'story-1', score: 5 },
    });
    expect(prisma.story.update).toHaveBeenCalledWith({
      where: { id: 'story-1' },
      data: { rating: 4.3, ratingCount: 3 },
    });
  });

  it('throws when the story does not exist', async () => {
    const { prisma, service } = createService();
    (prisma.story.findUnique as any).mockResolvedValue(null);

    await expect(service.rate('user-1', 'missing-story', 4)).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.rating.upsert).not.toHaveBeenCalled();
  });
});
