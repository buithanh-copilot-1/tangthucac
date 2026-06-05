import { IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'new_username' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'username chỉ được chứa chữ, số và dấu _' })
  username?: string;

  @ApiPropertyOptional({ example: 'Nguyễn Văn A' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;
}

export class UpdateSettingsDto {
  @ApiPropertyOptional({ enum: ['sm', 'md', 'lg', 'xl'] })
  @IsOptional()
  @IsEnum(['sm', 'md', 'lg', 'xl'])
  fontSize?: string;

  @ApiPropertyOptional({ enum: ['light', 'dark'] })
  @IsOptional()
  @IsEnum(['light', 'dark'])
  theme?: string;

  @ApiPropertyOptional({ enum: ['normal', 'relaxed', 'loose'] })
  @IsOptional()
  @IsEnum(['normal', 'relaxed', 'loose'])
  lineHeight?: string;

  @ApiPropertyOptional({ enum: ['sans', 'serif'] })
  @IsOptional()
  @IsEnum(['sans', 'serif'])
  fontFamily?: string;

  @ApiPropertyOptional({ enum: ['vi', 'en'] })
  @IsOptional()
  @IsEnum(['vi', 'en'])
  language?: string;
}
