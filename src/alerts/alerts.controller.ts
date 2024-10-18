import { Body, Controller, Post } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { SetAlertDto } from './alerts.dto';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post('/set')
  setAlerts(@Body() setAlertDto: SetAlertDto) {
    return this.alertsService.setAlert(setAlertDto);
  }
}
