import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BakongKHQR, khqrData, MerchantInfo, IndividualInfo } from 'bakong-khqr';
import { Currency, IndividualKHQRRequest, KHQRResponse, MerchantKHQRRequest } from './app.model';

@Injectable()
export class AppService {

  private logger = new Logger(AppService.name);

  generateIndividual(data: IndividualKHQRRequest): KHQRResponse {
    const currency =
      data.currency === Currency.USD
        ? khqrData.currency.usd
        : khqrData.currency.khr;
    const info: IndividualInfo = {
      bakongAccountID: data.bakongAccountID,
      merchantName: data.merchantName,
      merchantCity: data.merchantCity,
      currency: currency,
      amount: data.amount,
      expirationTimestamp: this.getExpiry(data)
    };
    this.logger.log(`generate individual KHQR ${JSON.stringify(info)}`);
    const khqr = new BakongKHQR();
    const individual = khqr.generateIndividual(info);
    this.validate(individual);
    return { qr: individual.data.qr, hash: individual.data.md5 };
  }

  generateMerchant(data: MerchantKHQRRequest): KHQRResponse {
    const currency =
      data.currency === Currency.USD
        ? khqrData.currency.usd
        : khqrData.currency.khr;
    const info: MerchantInfo = {
      bakongAccountID: data.bakongAccountID,
      merchantName: data.merchantName,
      merchantCity: data.merchantCity,
      merchantID: data.merchantID,
      acquiringBank: data.acquiringBank,
      currency: currency,
      amount: data.amount,
      expirationTimestamp: this.getExpiry(data)
    };
    this.logger.log(`generate merchant KHQR ${JSON.stringify(info)}`);
    const khqr = new BakongKHQR();
    const merchant = khqr.generateMerchant(info);
    this.validate(merchant);
    return { qr: merchant.data.qr, hash: merchant.data.md5 };
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
    this.logger.log(
      `validate generate KHQR result:${JSON.stringify(result)}`,
    );
    if (
      !result ||
      !result.data ||
      !result.data.qr
    )
      throw new BadRequestException(result.status.message);
    const khqrString = result.data.qr;
    const isKHQR = BakongKHQR.verify(khqrString);
    if (!isKHQR || isKHQR.isValid === false)
      throw new BadRequestException('invalid QR verifed false');
    this.logger.log(`verify QR is valid:${isKHQR.isValid}`);
  }
}
