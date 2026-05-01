import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderMenuDto {
  @ApiProperty({ example: 1, description: 'New order position (1-based, minimum 1)' })
    @IsInt()
    @Min(1)
    order!: number;
}