import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { Genre, StoryStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryStoriesDto {
  @ApiPropertyOptional() @IsOptional() @IsString() q?: string;
  @ApiPropertyOptional({ enum: Genre }) @IsOptional() @IsEnum(Genre) genre?: Genre;
  @ApiPropertyOptional({ enum: StoryStatus }) @IsOptional() @IsEnum(StoryStatus) status?: StoryStatus;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => parseInt(value)) @IsInt() @Min(1) page?: number = 1;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => parseInt(value)) @IsInt() @Min(1) @Max(50) limit?: number = 20;
  @ApiPropertyOptional({ enum: ['views', 'rating', 'updatedAt', 'title'] })
  @IsOptional() @IsString() sort?: 'views' | 'rating' | 'updatedAt' | 'title' = 'views';
}
