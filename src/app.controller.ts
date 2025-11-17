import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { IndividualKHQRRequest, KHQRResponse, MerchantKHQRRequest } from './app.model';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post('individual')
  @HttpCode(HttpStatus.OK)
  generateIndividual(@Body() data: IndividualKHQRRequest): KHQRResponse {
    return this.appService.generateIndividual(data);
  }

  @Post('merchant')
  @HttpCode(HttpStatus.OK)
  generateMerchant(@Body() data: MerchantKHQRRequest): KHQRResponse {
    return this.appService.generateMerchant(data);
  }
}
