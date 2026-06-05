import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Bookmarks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookmarks')
export class BookmarksController {
  constructor(private bookmarksService: BookmarksService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách truyện yêu thích' })
  getAll(@CurrentUser() user: { id: string }) {
    return this.bookmarksService.getAll(user.id);
  }

  @Post(':storyId')
  @ApiOperation({ summary: 'Thêm vào yêu thích' })
  add(@CurrentUser() user: { id: string }, @Param('storyId') storyId: string) {
    return this.bookmarksService.add(user.id, storyId);
  }

  @Delete(':storyId')
  @ApiOperation({ summary: 'Xóa khỏi yêu thích' })
  remove(@CurrentUser() user: { id: string }, @Param('storyId') storyId: string) {
    return this.bookmarksService.remove(user.id, storyId);
  }
}
