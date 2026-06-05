import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StoriesService } from './stories.service';
import { QueryStoriesDto } from './dto/query-stories.dto';

@ApiTags('Stories')
@Controller('stories')
export class StoriesController {
  constructor(private storiesService: StoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách truyện (filter + search + paging)' })
  findAll(@Query() query: QueryStoriesDto) {
    return this.storiesService.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Truyện nổi bật' })
  featured() { return this.storiesService.findFeatured(); }

  @Get('hot')
  @ApiOperation({ summary: 'Truyện hot' })
  hot() { return this.storiesService.findHot(); }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết truyện' })
  findOne(@Param('id') id: string) {
    return this.storiesService.findOne(id);
  }

  @Get(':id/chapters')
  @ApiOperation({ summary: 'Danh sách chương' })
  chapters(@Param('id') id: string) {
    return this.storiesService.findChapters(id);
  }

  @Get(':id/chapters/:number')
  @ApiOperation({ summary: 'Nội dung chương' })
  chapter(@Param('id') id: string, @Param('number', ParseIntPipe) number: number) {
    return this.storiesService.findChapter(id, number);
  }
}
