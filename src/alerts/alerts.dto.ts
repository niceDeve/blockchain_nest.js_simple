import { IsEmail, IsIn, IsNumber } from 'class-validator';

export class SetAlertDto {
  @IsNumber()
  @IsIn([0, 1])
  chain: number;

  @IsNumber()
  price: number;

  @IsEmail()
  email: string;
}
