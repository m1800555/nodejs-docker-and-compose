import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WishesService } from 'src/wishes/wishes.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly wishesService: WishesService,
  ) {}

  async findAll(): Promise<Wishlist[]> {
    return this.wishlistRepository.find({
      relations: ['owner', 'items'],
    });
  }

  async create(createWishlistDto: CreateWishlistDto, user: User) {
    const { itemsId, ...rest } = createWishlistDto;
    const items = await this.wishesService.findManyByIds(itemsId);
    const wishlist = await this.wishlistRepository.save({
      items,
      owner: user,
      ...rest,
    });
    return wishlist;
  }

  async findById(id: number): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });
    if (!wishlist) {
      throw new NotFoundException('Список не найден');
    }
    return wishlist;
  }

  async update(wishlistId: number, updateWishlistDto: UpdateWishlistDto, userId: number): Promise<Wishlist> {
    const wishlist = await this.findById(wishlistId);
    if (!wishlist) {
      throw new NotFoundException('Список не найден');
    }
    if (wishlist.owner.id !== userId) {
      throw new ConflictException('Чужие списки нельзя редактировать');
    }

    const { itemsId, name, image } = updateWishlistDto;
    const wishes = itemsId?.length ? await this.wishesService.findManyByIds(itemsId) : [];

    return this.wishlistRepository.save({
      ...wishlist,
      name,
      image,
      items: wishes,
    });
  }

  async remove(wishlistId: number, userId: number): Promise<Wishlist> {
    const wishlist = await this.findById(wishlistId);
    if (!wishlist) {
      throw new NotFoundException('Список не найден');
    }
    if (wishlist.owner.id !== userId) {
      throw new ConflictException('Чужие списки нельзя удалять');
    }
    return this.wishlistRepository.remove(wishlist);
  }
}
