import { IsString, IsInt, IsOptional, MinLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({ example: 'Home' })
    @IsString()
    @MinLength(1)
    name!: string;

  @ApiProperty({ example: 1, required: false, nullable: true })
  @IsInt()
  @IsOptional()
  parentId?: number | null;

  @ApiProperty({ example: 0, required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}