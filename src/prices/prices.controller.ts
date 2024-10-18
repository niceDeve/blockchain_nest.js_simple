import { Controller, Get } from '@nestjs/common';
import { PricesService } from './prices.service';

@Controller('prices')
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @Get('/hourly')
  getHourlyPrices() {
    return this.pricesService.getHourlyPrices();
  }
}
