import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { UpsertProgressDto } from './dto/upsert-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Get()
  @ApiOperation({ summary: 'Lịch sử đọc' })
  getAll(@CurrentUser() user: { id: string }) {
    return this.progressService.getAll(user.id);
  }

  @Get(':storyId')
  @ApiOperation({ summary: 'Tiến độ đọc theo truyện' })
  getOne(@CurrentUser() user: { id: string }, @Param('storyId') storyId: string) {
    return this.progressService.getOne(user.id, storyId);
  }

  @Post()
  @ApiOperation({ summary: 'Cập nhật tiến độ đọc' })
  upsert(@CurrentUser() user: { id: string }, @Body() dto: UpsertProgressDto) {
    return this.progressService.upsert(user.id, dto);
  }
}
