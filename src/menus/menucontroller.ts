import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ReorderMenuDto } from './dto/reorder-menu.dto';

@ApiTags('menus')
@Controller('menus')
export class MenuController {
  constructor(private readonly menusService: MenuService) { }

  @Get()
  @ApiOperation({ summary: 'Get all menus as tree structure' })
  @ApiResponse({ status: 200, description: 'Returns menu tree' })
  findAll() {
    return this.menusService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single menu by id' })
  @ApiResponse({ status: 200, description: 'Returns single menu' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menusService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new menu item' })
  @ApiResponse({ status: 201, description: 'Menu created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() dto: CreateMenuDto) {
    return this.menusService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update menu item' })
  @ApiResponse({ status: 200, description: 'Menu updated successfully' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuDto,
  ) {
    return this.menusService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete menu item and its children' })
  @ApiResponse({ status: 200, description: 'Menu deleted successfully' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menusService.remove(id);
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Move menu item to different parent' })
  @ApiResponse({ status: 200, description: 'Menu moved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid move operation' })
  move(
    @Param('id', ParseIntPipe) id: number,
    @Body('parentId') parentId: number | null,
  ) {
    return this.menusService.move(id, parentId ?? null);
  }

  @Patch(':id/reorder')
  @ApiOperation({ summary: 'Reorder menu item within same level' })
  @ApiResponse({ status: 200, description: 'Menu reordered successfully' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  reorder(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReorderMenuDto,
  ) {
    return this.menusService.reorder(id, dto.order);
  }
}