import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, Like } from 'typeorm';

import { HashService } from 'src/hash/hash.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private hashService: HashService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { username, email, password } = createUserDto;

    const existingUser = await this.usersRepository.findOne({
      where: [{ username }, { email }],
    });
    if (existingUser) {
      throw new ConflictException('Пользователь с таким email или username уже зарегистрирован');
    }
    const hashedPassword = await this.hashService.getHash(password);
    const user = await this.usersRepository.save({
      ...createUserDto,
      password: hashedPassword,
    });
    delete user.password;
    return user;
  }

  async findOne(query: FindOneOptions<User>): Promise<User> {
    return this.usersRepository.findOne(query);
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const { username, email, password } = updateUserDto;

    if (username && username !== user.username) {
      const existingUser = await this.usersRepository.findOne({
        where: { username },
      });
      if (existingUser) {
        throw new ConflictException('Пользователь с таким username уже зарегистрирован');
      }
    }

    if (email && email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email },
      });
      if (existingUser) {
        throw new ConflictException('Пользователь с таким email уже зарегистрирован');
      }
    }

    if (password) {
      updateUserDto.password = await this.hashService.getHash(password);
    }
    const updatedUser = await this.usersRepository.save({ ...user, ...updateUserDto });

    delete updatedUser.password;
    return updatedUser;
  }

  async findMany({ query }: FindUserDto): Promise<User[]> {
    return (
      (await this.usersRepository.find({
        where: [{ username: Like(`%${query}%`) }, { email: Like(`%${query}%`) }],
      })) || []
    );
  }
}
