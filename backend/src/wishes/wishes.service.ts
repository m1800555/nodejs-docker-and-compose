import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WishesService {
  constructor(@InjectRepository(Wish) private readonly wishRepository: Repository<Wish>) {}

  async create(createWishDto: CreateWishDto, user: User) {
    return this.wishRepository.save({ ...createWishDto, owner: user });
  }

  async findLast(): Promise<Wish[]> {
    return this.wishRepository.find({
      order: { createdAt: 'DESC' },
      take: 40,
      relations: ['owner', 'offers', 'offers.user'],
    });
  }

  async findTop(): Promise<Wish[]> {
    return this.wishRepository.find({
      order: { copied: 'DESC' },
      take: 20,
      relations: ['owner', 'offers', 'offers.user'],
    });
  }

  async findById(id: number) {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: ['owner', 'offers', 'offers.user'],
    });
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    return wish;
  }

  async findManyByIds(ids: number[]) {
    return await this.wishRepository.find({ where: { id: In(ids) } });
  }

  async update(wishId: number, updateWishDto: UpdateWishDto, userId: number): Promise<Wish> {
    const wish = await this.findById(wishId);
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    if (wish.owner.id !== userId) {
      throw new ConflictException('Чужие подарки нельзя редактировать');
    }
    if (updateWishDto.price && wish.raised > 0) {
      throw new ConflictException('Нельзя изменить стоимость подарка');
    }
    return this.wishRepository.save({ ...wish, ...updateWishDto });
  }

  async updateRaised(id: number, raised: number) {
    const wish = await this.wishRepository.update(id, { raised });
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    return wish;
  }

  async remove(wishId: number, userId: number): Promise<Wish> {
    const wish = await this.findById(wishId);
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    if (wish.owner.id !== userId) {
      throw new ConflictException('Чужие подарки нельзя удалять');
    }
    return this.wishRepository.remove(wish);
  }

  async copy(wishId: number, user: User): Promise<Wish> {
    const wish = await this.findById(wishId);
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    if (user.id === wish.owner.id) {
      throw new ConflictException('Свои подарки нельзя добавлять');
    }
    const isAlreadyCopied = await this.wishRepository.findOne({
      where: {
        owner: { id: user.id },
        name: wish.name,
      },
    });
    if (isAlreadyCopied) {
      throw new ConflictException('Подарок уже добавлен');
    }

    await this.wishRepository.update(wishId, { copied: wish.copied + 1 });

    delete wish.id;
    delete wish.raised;
    delete wish.copied;
    delete wish.offers;
    return this.create({ ...wish }, user);
  }

  async findWishesByUserId(ownerId: number): Promise<Wish[]> {
    return await this.wishRepository.find({
      where: { owner: { id: ownerId } },
      relations: ['owner', 'offers', 'offers.user'],
    });
  }

  async findWishesByUsername(username: string): Promise<Wish[]> {
    return await this.wishRepository.find({
      where: { owner: { username } },
      relations: ['owner', 'offers', 'offers.user'],
    });
  }
}
