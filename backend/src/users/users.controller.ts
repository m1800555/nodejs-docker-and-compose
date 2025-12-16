import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';

import { UsersService } from './users.service';
import { WishesService } from 'src/wishes/wishes.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import { User } from './entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { AuthUser } from 'src/common/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly wishesService: WishesService) {}

  @Get('me')
  async findMe(@AuthUser('id') id: number): Promise<User> {
    return await this.usersService.findById(id);
  }

  @Patch('me')
  async updateMe(@AuthUser('id') id: number, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Get('me/wishes')
  async findMyWishes(@AuthUser('id') id: number): Promise<Wish[]> {
    return await this.wishesService.findWishesByUserId(id);
  }

  @Get(':username')
  async findByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }

  @Get(':username/wishes')
  async findUserWishes(@Param('username') username: string): Promise<Wish[]> {
    return await this.wishesService.findWishesByUsername(username);
  }

  @Post('find')
  async findMany(@Body() findUserDto: FindUserDto): Promise<User[]> {
    return await this.usersService.findMany(findUserDto);
  }
}
