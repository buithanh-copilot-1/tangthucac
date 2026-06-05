import { IsEnum } from 'class-validator';
import { ShelfStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertShelfDto {
  @ApiProperty({ enum: ShelfStatus })
  @IsEnum(ShelfStatus)
  status: ShelfStatus;
}
