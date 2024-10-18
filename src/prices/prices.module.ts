import { Module } from '@nestjs/common';
import { PricesService } from './prices.service';
import { PricesController } from './prices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Price } from './prices.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Price]), EmailModule],
  providers: [PricesService],
  controllers: [PricesController],
  exports: [TypeOrmModule.forFeature([Price])],
})
export class PricesModule {}
