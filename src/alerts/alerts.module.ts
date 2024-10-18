import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from '../email/email.module';
import { Alert } from './alerts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Alert]), EmailModule],
  providers: [AlertsService],
  controllers: [AlertsController],
})
export class AlertsModule {}
