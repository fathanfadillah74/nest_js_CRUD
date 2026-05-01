import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('menus')
export class Menu {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 255 })
    name!: string;

    @Column({ name: 'parent_id', nullable: true })
    parentId!: number | null;

    @Column({ name: 'order', default: 0 })
    order!: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    // Relasi ke parent
    @ManyToOne(() => Menu, (menu) => menu.children, { nullable: true })
    @JoinColumn({ name: 'parent_id' })
    parent!: Menu;

    // Relasi ke children
    @OneToMany(() => Menu, (menu) => menu.parent)
    children!: Menu[];
}