import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import {
  BakongKHQR,
  khqrData,
  MerchantInfo,
  IndividualInfo,
} from 'bakong-khqr';
import {
  CheckStatusRequest,
  Currency,
  IndividualKHQRRequest,
  KHQRResponse,
  MerchantKHQRRequest,
  StatusResponse,
} from './app.model';
import axios, { AxiosError } from 'axios';

@Injectable()
export class AppService {
  private logger = new Logger(AppService.name);

  generateIndividual(body: IndividualKHQRRequest): KHQRResponse {
    const currency =
      body.currency === Currency.USD
        ? khqrData.currency.usd
        : khqrData.currency.khr;
    const info: IndividualInfo = {
      bakongAccountID: body.bakongAccountID,
      merchantName: body.merchantName,
      merchantCity: body.merchantCity,
      currency: currency,
      amount: body.amount,
      expirationTimestamp: this.getExpiry(body),
    };
    this.logger.log(`generate individual KHQR ${JSON.stringify(info)}`);
    const khqr = new BakongKHQR();
    const individual = khqr.generateIndividual(info);
    this.validate(individual);
    return { qr: individual.data.qr, hash: individual.data.md5 };
  }

  generateMerchant(body: MerchantKHQRRequest): KHQRResponse {
    const currency =
      body.currency === Currency.USD
        ? khqrData.currency.usd
        : khqrData.currency.khr;
    const info: MerchantInfo = {
      bakongAccountID: body.bakongAccountID,
      merchantName: body.merchantName,
      merchantCity: body.merchantCity,
      merchantID: body.merchantID,
      acquiringBank: body.acquiringBank,
      currency: currency,
      amount: body.amount,
      expirationTimestamp: this.getExpiry(body),
    };
    this.logger.log(`generate merchant KHQR ${JSON.stringify(info)}`);
    const khqr = new BakongKHQR();
    const merchant = khqr.generateMerchant(info);
    this.validate(merchant);
    return { qr: merchant.data.qr, hash: merchant.data.md5 };
  }

  async checkTransactionStatus(
    authHeader: string,
    body: CheckStatusRequest,
  ): Promise<StatusResponse> {
    try {
      if (!authHeader || authHeader.length == 0) {
        this.logger.warn(`authorization header:${authHeader}`);
        throw new UnauthorizedException('unauthorized access');
      }
      const baseUrl = process.env.BASE_URL || 'https://api-bakong.nbc.gov.kh';
      const checkStatusUrl =
        process.env.CHECK_STATUS_URL ||
        baseUrl + '/v1/check_transaction_by_md5';
      this.logger.log(
        `request check transaction url:${checkStatusUrl}, body:${JSON.stringify(body)}`,
      );
      const response = await axios.post(checkStatusUrl, body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
      });
      const data = response.data;
      this.logger.log(
        `response check transaction status:${response.status}, body:${JSON.stringify(data)}`,
      );
      return data;
    } catch (ex) {
      this.logger.error(ex);
      if (ex instanceof AxiosError) this.logger.error(ex.response.data);
      throw ex;
    }
  }

  private getExpiry(data: any): number {
    let expiry = data.expirationTimestamp;
    if (data.amount && data.amount > 0) {
      const expireOneHour = Date.now() + 1 * 60 * 1000; // 1 hour from now
      expiry = expiry ? expiry : expireOneHour;
    }
    return expiry;
  }

  private validate(result: any): void {
    this.logger.log(`validate generate KHQR result:${JSON.stringify(result)}`);
    if (!result || !result.data || !result.data.qr)
      throw new BadRequestException(result.status.message);
    const khqrString = result.data.qr;
    const isKHQR = BakongKHQR.verify(khqrString);
    if (!isKHQR || isKHQR.isValid === false)
      throw new BadRequestException('invalid QR verifed false');
    this.logger.log(`verify QR is valid:${isKHQR.isValid}`);
  }
}
