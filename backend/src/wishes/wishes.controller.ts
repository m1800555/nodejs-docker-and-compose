import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';

import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';
import { User } from 'src/users/entities/user.entity';
import { AuthUser } from 'src/common/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  create(@AuthUser() user: User, @Body() createWishDto: CreateWishDto) {
    return this.wishesService.create(createWishDto, user);
  }

  @Get('last')
  async findLast(): Promise<Wish[]> {
    return await this.wishesService.findLast();
  }

  @Get('top')
  async findTop(): Promise<Wish[]> {
    return await this.wishesService.findTop();
  }

  @Get(':id')
  async findById(@Param('id') id: number): Promise<Wish> {
    return await this.wishesService.findById(id);
  }

  @Patch(':id')
  async updateOne(
    @Param('id') wishId: number,
    @AuthUser('id') userId: number,
    @Body() updateWishDto: UpdateWishDto,
  ): Promise<Wish> {
    return this.wishesService.update(wishId, updateWishDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') wishId: number, @AuthUser('id') userId: number): Promise<Wish> {
    return this.wishesService.remove(wishId, userId);
  }

  @Post(':id/copy')
  copy(@Param('id') wishId: number, @AuthUser() user: User): Promise<Wish> {
    return this.wishesService.copy(wishId, user);
  }
}
