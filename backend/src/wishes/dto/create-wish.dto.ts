import { IsString, IsNumber, IsUrl, Length, Min } from 'class-validator';
export class CreateWishDto {
  @Length(1, 250)
  name: string;

  @IsString()
  link: string;

  @IsUrl()
  image: string;

  @IsNumber()
  @Min(0)
  price: number;

  @Length(1, 1024)
  description: string;
}
