import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import {
  CheckStatusRequest,
  IndividualKHQRRequest,
  KHQRResponse,
  MerchantKHQRRequest,
  StatusResponse,
} from './app.model';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('individual')
  @HttpCode(HttpStatus.OK)
  generateIndividual(@Body() body: IndividualKHQRRequest): KHQRResponse {
    return this.appService.generateIndividual(body);
  }

  @Post('merchant')
  @HttpCode(HttpStatus.OK)
  generateMerchant(@Body() body: MerchantKHQRRequest): KHQRResponse {
    return this.appService.generateMerchant(body);
  }

  @Post('status')
  @HttpCode(HttpStatus.OK)
  async checkTransactionStatus(
    @Headers('authorization') authHeader: string,
    @Body() body: CheckStatusRequest,
  ): Promise<StatusResponse> {
    return this.appService.checkTransactionStatus(authHeader, body);
  }
}
