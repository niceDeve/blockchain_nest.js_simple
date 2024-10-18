import { Injectable, OnModuleInit } from '@nestjs/common';
import Moralis from 'moralis';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { Price } from './prices.entity';
import { EmailService } from '../email/email.service';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class PricesService implements OnModuleInit {
  constructor(
    @InjectRepository(Price)
    private priceRepository: Repository<Price>,
    private readonly emailService: EmailService,
  ) {}

  async onModuleInit() {
    try {
      await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
      console.log('Moralis Initialized Successfully');
    } catch (error) {
      console.error('Error initializing Moralis:', error);
    }
  }

  private async fetchPrice(): Promise<number[]> {
    try {
      const token_price_response =
        await Moralis.EvmApi.token.getMultipleTokenPrices(
          {
            chain: '0x1',
          },
          {
            tokens: [
              { tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' },
              { tokenAddress: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0' },
            ],
          },
        );
      const prices = token_price_response.raw.map((item) => item.usdPrice);
      console.log('successful to fetch: ', prices);
      return prices;
    } catch (e) {
      console.error('Failed to fetch token price: ', e);
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCronGetPrice() {
    const prices = await this.fetchPrice();
    if (prices[0] && prices[1]) {
      await this.savePrice(prices[0], prices[1]);
      console.log('successful to save');
    }
  }

  private async savePrice(eth_price, pol_price) {
    const priceRecord = this.priceRepository.create({
      timestamp: new Date(),
      eth_price: eth_price,
      pol_price: pol_price,
    });

    await this.priceRepository.save(priceRecord);
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCronIncreasingPriceAlert() {
    await this.priceIncreasingDetect();
    console.log('Successful to detect increasing price');
  }

  private async priceIncreasingDetect() {
    const currentTime = new Date();
    const oneHourAgo = new Date(currentTime.getTime() - 1000 * 60 * 60);
    const latestPrices = await this.priceRepository.find({
      order: { timestamp: 'DESC' },
      take: 1,
    });
    const oldPrices = await this.priceRepository.findOne({
      where: {
        timestamp: LessThan(oneHourAgo),
      },
      order: { timestamp: 'DESC' },
    });

    if (latestPrices.length > 0 && oldPrices) {
      const { eth_price: currentEthPrice, pol_price: currentPolPrice } =
        latestPrices[0];
      const { eth_price: oldEthPrice, pol_price: oldPolPrice } = oldPrices;

      if ((currentEthPrice - oldEthPrice) / oldEthPrice > 0.03) {
        await this.emailService.sendEmail(
          process.env.RECEIVER_GMAIL,
          'Eth price is increasing!',
          'Ethereum price has increased by more than 3% from one hour ago!',
        );
        console.log(
          'Ethereum price has increased by more than 3% from one hour ago!',
          currentEthPrice,
          oldEthPrice,
        );
      }

      if ((currentPolPrice - oldPolPrice) / oldPolPrice > 0.03) {
        await this.emailService.sendEmail(
          process.env.RECEIVER_GMAIL,
          'Pol price is increasing!',
          'Polygon price has increased by more than 3% from one hour ago!',
        );
        console.log(
          'Polygon price has increased by more than 3% from one hour ago!',
          currentPolPrice,
          oldPolPrice,
        );
      }
    }
  }

  async getHourlyPrices() {
    const query = `
        SELECT DISTINCT ON (date_trunc('hour', timestamp))
            date_trunc('hour', timestamp) as rounded_hour,
            timestamp,
            eth_price,
            pol_price
        FROM
            price
        WHERE
            timestamp >= NOW() - INTERVAL '24 hours'
        ORDER BY
            date_trunc('hour', timestamp),
            abs(EXTRACT(epoch FROM (timestamp - date_trunc('hour', timestamp))))
        `;
    const priceData = await this.priceRepository.query(query);
    return priceData;
  }
}
