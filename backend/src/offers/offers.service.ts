import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WishesService } from 'src/wishes/wishes.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly wishService: WishesService,
  ) {}

  async create(createOfferDto: CreateOfferDto, user: User): Promise<Offer> {
    const { itemId, amount } = createOfferDto;

    const wish = await this.wishService.findById(itemId);
    if (wish.owner.id === user.id) {
      throw new ConflictException('Нельзя скинуться на свой подарок');
    }

    const total = +wish.raised + amount;
    if (total > wish.price) {
      throw new ConflictException('Сумма предложения превышает оставшуюся сумму');
    }

    await this.wishService.updateRaised(itemId, total);

    const offer = this.offerRepository.create({
      ...createOfferDto,
      user,
      item: wish,
    });
    return this.offerRepository.save(offer);
  }

  async findAll(): Promise<Offer[]> {
    return await this.offerRepository.find({
      relations: ['user', 'item'],
    });
  }

  async findById(id: number): Promise<Offer> {
    const offer = await this.offerRepository.findOne({
      where: { id },
      relations: ['user', 'user.wishes', 'item', 'item.owner', 'item.offers'],
    });
    if (!offer) {
      throw new NotFoundException('Заявка не найдена');
    }
    return offer;
  }
}
