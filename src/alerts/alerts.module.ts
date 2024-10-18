import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from '../email/email.module';
import { Alert } from './alerts.entity';
import { PricesModule } from '../prices/prices.module';

@Module({
  imports: [TypeOrmModule.forFeature([Alert]), PricesModule, EmailModule],
  providers: [AlertsService],
  controllers: [AlertsController],
})
export class AlertsModule {}
