import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricesModule } from './prices/prices.module';
import { AlertsModule } from './alerts/alerts.module';
import { SwapModule } from './swap/swap.module';
import { EmailModule } from './email/email.module';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    PricesModule,
    AlertsModule,
    SwapModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: true, // Note: set false in prod
    }),
    ScheduleModule.forRoot(),
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
