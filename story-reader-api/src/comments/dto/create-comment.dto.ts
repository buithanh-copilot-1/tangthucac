import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'Truyện hay quá!' })
  @IsString()
  @MinLength(1, { message: 'Bình luận không được để trống' })
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional({ description: 'ID comment cha nếu là reply' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
