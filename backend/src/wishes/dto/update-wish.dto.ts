import { PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

import { CreateWishDto } from './create-wish.dto';

export class UpdateWishDto extends PartialType(CreateWishDto) {
  @IsNumber()
  @Min(0)
  @IsOptional()
  raised: number;
}
