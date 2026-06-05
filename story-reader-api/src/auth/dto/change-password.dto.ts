import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  currentPassword: string;

  @ApiProperty({ example: 'NewPassword123' })
  @IsString()
  @MinLength(6, { message: 'Mat khau moi phai it nhat 6 ky tu' })
  @MaxLength(72)
  newPassword: string;
}
