import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, Not } from 'typeorm';
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
    if (dto.parent_id) {
      const parent = await this.menuRepository.findOne({
        where: { id: dto.parent_id },
      });
      if (!parent) {
        throw new NotFoundException(`Parent menu #${dto.parent_id} not found`);
      }
    }

    const parentId: any = dto.parent_id ?? null;

    if (dto.order === undefined) {
      const siblings = await this.menuRepository.count({
        where: { parent_id: parentId },
      });
      dto.order = siblings;
    } else {
      // Cek max order yang ada
      const maxOrderItem = await this.menuRepository.findOne({
        where: { parent_id: parentId },
        order: { order: 'DESC' },
      });
      const maxOrder = maxOrderItem ? maxOrderItem.order : -1;

      // Jika order baru ada di tengah, increment items yang >= order baru
      if (dto.order <= maxOrder) {
        const conflictingItems = await this.menuRepository.find({
          where: {
            parent_id: parentId,
            order: MoreThanOrEqual(dto.order),
          },
          order: { order: 'ASC' },
        });
        for (const item of conflictingItems) {
          item.order += 1;
        }
        await this.menuRepository.save(conflictingItems);
      }
    }

    const menu = this.menuRepository.create({
      name: dto.name,
      parent_id: parentId,
      order: dto.order,
    });

    return this.menuRepository.save(menu);
  }

  async update(id: number, dto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) throw new NotFoundException(`Menu #${id} not found`);

    const parentId: any = dto.parent_id ?? menu.parent_id ?? null;

    if (dto.order !== undefined && dto.order !== menu.order) {
      const maxOrderItem = await this.menuRepository.findOne({
        where: { parent_id: parentId },
        order: { order: 'DESC' },
      });
      const maxOrder = maxOrderItem ? maxOrderItem.order : -1;

      if (dto.order <= maxOrder) {
        const conflictingItems = await this.menuRepository.find({
          where: {
            parent_id: parentId,
            order: MoreThanOrEqual(dto.order),
            id: Not(id),
          },
          order: { order: 'ASC' },
        });
        for (const item of conflictingItems) {
          item.order += 1;
        }
        await this.menuRepository.save(conflictingItems);
      }
    }

    Object.assign(menu, dto);
    return this.menuRepository.save(menu);
  }

  async remove(id: number): Promise<{ message: string }> {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) throw new NotFoundException(`Menu #${id} not found`);

    await this.menuRepository.remove(menu);
    return { message: `Menu #${id} deleted successfully` };
  }

  async move(id: number, newparent_id: number | null): Promise<Menu> {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) throw new NotFoundException(`Menu #${id} not found`);

    // Cegah menu jadi child dari dirinya sendiri
    if (newparent_id === id) {
      throw new BadRequestException('Menu cannot be its own parent');
    }

    // Cegah circular reference (parent tidak boleh jadi child dari child-nya)
    if (newparent_id) {
      const isDescendant = await this.checkIsDescendant(id, newparent_id);
      if (isDescendant) {
        throw new BadRequestException('Cannot move menu into its own descendant');
      }

      const newParent = await this.menuRepository.findOne({
        where: { id: newparent_id },
      });
      if (!newParent) {
        throw new NotFoundException(`Parent menu #${newparent_id} not found`);
      }
    }

    menu.parent_id = newparent_id;
    return this.menuRepository.save(menu);
  }

  async reorder(id: number, newOrder: number): Promise<Menu[]> {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) throw new NotFoundException(`Menu #${id} not found`);

    const siblings = await this.menuRepository.find({
      where: { parent_id: menu.parent_id ?? 0 },
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

  private buildTree(menus: Menu[], parent_id: number | null = null): Menu[] {
    return menus
      .filter((m) => m.parent_id === parent_id)
      .map((m) => ({
        ...m,
        children: this.buildTree(menus, m.id),
      }));
  }

  private async checkIsDescendant(id: number, targetId: number): Promise<boolean> {
    const children = await this.menuRepository.find({
      where: { parent_id: id },
    });
    for (const child of children) {
      if (child.id === targetId) return true;
      const found = await this.checkIsDescendant(child.id, targetId);
      if (found) return true;
    }
    return false;
  }
}