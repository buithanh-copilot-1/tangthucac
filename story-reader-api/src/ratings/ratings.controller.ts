import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RatingsService } from './ratings.service';
import { RateDto } from './dto/rate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Ratings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stories/:storyId/rating')
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Đánh giá của tôi cho truyện này' })
  getMine(@CurrentUser() user: { id: string }, @Param('storyId') storyId: string) {
    return this.ratingsService.getMyRating(user.id, storyId);
  }

  @Put()
  @ApiOperation({ summary: 'Đánh giá truyện (1-5 sao)' })
  rate(@CurrentUser() user: { id: string }, @Param('storyId') storyId: string, @Body() dto: RateDto) {
    return this.ratingsService.rate(user.id, storyId, dto.score);
  }
}
