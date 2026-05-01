import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderMenuDto {
  @ApiProperty({ example: 0, description: 'New position index (0-based)' })
    @IsInt()
    @Min(0)
    order!: number;
}