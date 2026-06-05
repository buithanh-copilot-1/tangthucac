import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Comments')
@Controller()
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  // Public — ai cũng xem được comment
  @Get('stories/:storyId/comments')
  @ApiOperation({ summary: 'Danh sách bình luận của truyện' })
  list(@Param('storyId') storyId: string) {
    return this.commentsService.list(storyId);
  }

  @Get('stories/:storyId/comments/count')
  @ApiOperation({ summary: 'Số lượng bình luận' })
  count(@Param('storyId') storyId: string) {
    return this.commentsService.count(storyId);
  }

  // Protected — cần login để viết / xóa
  @Post('stories/:storyId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Viết bình luận (hoặc reply nếu có parentId)' })
  create(
    @CurrentUser() user: { id: string },
    @Param('storyId') storyId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(user.id, storyId, dto);
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa bình luận của chính mình' })
  remove(@CurrentUser() user: { id: string }, @Param('commentId') commentId: string) {
    return this.commentsService.remove(user.id, commentId);
  }
}
