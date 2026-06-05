import { Controller, Get, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShelfStatus } from '@prisma/client';
import { ShelfService } from './shelf.service';
import { UpsertShelfDto } from './dto/upsert-shelf.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Shelf')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shelf')
export class ShelfController {
  constructor(private shelfService: ShelfService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy tủ truyện (tuỳ chọn filter theo status)' })
  getShelf(@CurrentUser() user: { id: string }, @Query('status') status?: ShelfStatus) {
    return this.shelfService.getShelf(user.id, status);
  }

  @Put(':storyId')
  @ApiOperation({ summary: 'Thêm / cập nhật truyện trong tủ' })
  upsert(@CurrentUser() user: { id: string }, @Param('storyId') storyId: string, @Body() dto: UpsertShelfDto) {
    return this.shelfService.upsert(user.id, storyId, dto.status);
  }

  @Delete(':storyId')
  @ApiOperation({ summary: 'Xóa khỏi tủ truyện' })
  remove(@CurrentUser() user: { id: string }, @Param('storyId') storyId: string) {
    return this.shelfService.remove(user.id, storyId);
  }
}
