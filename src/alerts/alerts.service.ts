import { Injectable, OnModuleInit } from '@nestjs/common';
import Moralis from 'moralis';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Alert } from './alerts.entity';
import { Price } from '../prices/prices.entity';
import { EmailService } from '../email/email.service';
import { Repository, LessThan } from 'typeorm';
import { SetAlertDto } from './alerts.dto';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private priceRepository: Repository<Price>,
    private alertRepository: Repository<Alert>,
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

  private async getGmailToAlert() {
    const latestPrices = await this.priceRepository.find({
      order: { timestamp: 'DESC' },
      take: 1,
    });

    if (latestPrices.length > 0) {
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
