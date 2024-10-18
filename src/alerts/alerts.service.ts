import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Alert } from './alerts.entity';
import { Price } from '../prices/prices.entity';
import { EmailService } from '../email/email.service';
import { Repository, LessThan, Any } from 'typeorm';
import { SetAlertDto } from './alerts.dto';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    @InjectRepository(Price)
    private priceRepository: Repository<Price>,
    private readonly emailService: EmailService,
  ) {}

  async onModuleInit() {
    // try {
    //   await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
    //   console.log('Moralis Initialized Successfully');
    // } catch (error) {
    //   console.error('Error initializing Moralis:', error);
    // }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCronSendAlert() {
    const result = await this.getGmailToAlert();
    if (result.length > 0) {
      result.map(async (item: any) => {
        try {
          await this.emailService.sendEmail(item.email, 'alert', item.text);
          console.log('Successful sent alert to ', item.email);
        } catch (e) {
          console.log('Failed to send alert: ', e);
        }
      });
    }
    console.log('---------------ehrere------------', result, typeof result);
  }

  private async getGmailToAlert() {
    try {
      const latestPrices = await this.priceRepository.find({
        order: { timestamp: 'DESC' },
        take: 1,
      });

      if (latestPrices.length > 0) {
        const { eth_price: currentEthPrice, pol_price: currentPolPrice } =
          latestPrices[0];
        const query = `
                SELECT
                    chain,
                    price,
                    email,
                    CASE WHEN chain = 1 THEN 'Ethereum' WHEN chain = 2 THEN 'Polygon' END as token_name
                FROM alert
                WHERE (chain = 1 AND price < $1) OR (chain = 2 AND price < $2)
            `;
        const result = await this.alertRepository.query(query, [
          currentEthPrice,
          currentPolPrice,
        ]);
        const alerts = result.map((row: any) => ({
          text: `${row.token_name} Price is higher than ${row.price}`,
          email: row.email,
        }));
        return alerts;
      } else {
        return [];
      }
    } catch (e) {
      console.error('Failed to get alertGmail: ', e);
    }
  }

  async setAlert({ chain, price, email }: SetAlertDto) {
    const alertRecord = this.alertRepository.create({
      chain: chain,
      price: price,
      email: email,
    });

    await this.alertRepository.save(alertRecord);
    console.log('Successful to set alert!!!');
  }
}
