import { IsInt, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertProgressDto {
  @ApiProperty() @IsString() storyId: string;
  @ApiProperty() @IsString() chapterId: string;
  @ApiProperty() @IsInt() @Min(1) chapterNumber: number;
  @ApiProperty() @IsNumber() @Min(0) scrollPosition: number;
}
