import { IsString, IsInt, IsOptional, MinLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMenuDto {
  @ApiProperty({ example: 'Home', required: false })
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;
}