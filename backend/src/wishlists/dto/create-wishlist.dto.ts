import { IsArray, IsInt, IsUrl, IsOptional, Length } from 'class-validator';

export class CreateWishlistDto {
  @Length(1, 250)
  name: string;

  @IsOptional()
  @Length(0, 1500)
  description: string;

  @IsUrl()
  image: string;

  @IsArray()
  @IsInt({ each: true })
  itemsId: number[];
}
