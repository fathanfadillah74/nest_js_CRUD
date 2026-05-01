import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) { }

  async findAll(): Promise<Menu[]> {
    const allMenus = await this.menuRepository.find({
      order: { order: 'ASC', id: 'ASC' },
    });
    return this.buildTree(allMenus);
  }

  async findOne(id: number): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!menu) throw new NotFoundException(`Menu #${id} not found`);
    return menu;
  }

  async create(dto: CreateMenuDto): Promise<Menu> {
    // Validasi parent exists kalau parentId dikirim
    if (dto.parentId) {
      const parent = await this.menuRepository.findOne({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException(`Parent menu #${dto.parentId} not found`);
      }
    }

    // Auto set order kalau tidak dikirim
    if (dto.order === undefined) {
      const siblings = await this.menuRepository.count({
        where: { parentId: dto.parentId ?? 0 },
      });
      dto.order = siblings;
    }

    const menu = this.menuRepository.create({
      name: dto.name,
      parentId: dto.parentId ?? null,
      order: dto.order,
    });

    return this.menuRepository.save(menu);
  }

  async update(id: number, dto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) throw new NotFoundException(`Menu #${id} not found`);

    Object.assign(menu, dto);
    return this.menuRepository.save(menu);
  }

  async remove(id: number): Promise<{ message: string }> {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) throw new NotFoundException(`Menu #${id} not found`);

    await this.menuRepository.remove(menu);
    return { message: `Menu #${id} deleted successfully` };
  }

  async move(id: number, newParentId: number | null): Promise<Menu> {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) throw new NotFoundException(`Menu #${id} not found`);

    // Cegah menu jadi child dari dirinya sendiri
    if (newParentId === id) {
      throw new BadRequestException('Menu cannot be its own parent');
    }

    // Cegah circular reference (parent tidak boleh jadi child dari child-nya)
    if (newParentId) {
      const isDescendant = await this.checkIsDescendant(id, newParentId);
      if (isDescendant) {
        throw new BadRequestException('Cannot move menu into its own descendant');
      }

      const newParent = await this.menuRepository.findOne({
        where: { id: newParentId },
      });
      if (!newParent) {
        throw new NotFoundException(`Parent menu #${newParentId} not found`);
      }
    }

    menu.parentId = newParentId;
    return this.menuRepository.save(menu);
  }

  async reorder(id: number, newOrder: number): Promise<Menu[]> {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) throw new NotFoundException(`Menu #${id} not found`);

    const siblings = await this.menuRepository.find({
      where: { parentId: menu.parentId ?? 0 },
      order: { order: 'ASC' },
    });

    const filtered = siblings.filter((s) => s.id !== id);

    filtered.splice(newOrder, 0, menu);

    const updated = filtered.map((item, index) => ({
      ...item,
      order: index,
    }));

    return this.menuRepository.save(updated);
  }

  // ---- Helper functions ----

  private buildTree(menus: Menu[], parentId: number | null = null): Menu[] {
    return menus
      .filter((m) => m.parentId === parentId)
      .map((m) => ({
        ...m,
        children: this.buildTree(menus, m.id),
      }));
  }

  private async checkIsDescendant(id: number, targetId: number): Promise<boolean> {
    const children = await this.menuRepository.find({
      where: { parentId: id },
    });
    for (const child of children) {
      if (child.id === targetId) return true;
      const found = await this.checkIsDescendant(child.id, targetId);
      if (found) return true;
    }
    return false;
  }
}