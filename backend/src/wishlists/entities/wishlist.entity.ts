import { Entity, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { IsUrl, Length } from 'class-validator';

import { BaseModel } from 'src/common/entities/base.model';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';

@Entity()
export class Wishlist extends BaseModel {
  @Column()
  @Length(1, 250)
  name: string;

  @Column({ default: '' })
  @Length(0, 1500)
  description: string;

  @Column()
  @IsUrl()
  image: string;

  @ManyToMany(() => Wish, (wish) => wish.name)
  @JoinTable()
  items: Wish[];

  @ManyToOne(() => User, (user) => user.wishlists)
  owner: User;
}
