import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export enum Currency {
    KHR = "KHR",
    USD = "USD"
}

export class OptionalParam {

    readonly accountInformation: string;
    readonly merchantName: string;
    readonly merchantCity: string;
    readonly billNumber: string;
    readonly storeLabel: string;
    readonly terminalLabel: string;
    readonly mobileNumber: string;
    readonly purposeOfTransaction: string;
    readonly languagePreference: string;
    readonly merchantNameAlternateLanguage: string;
    readonly merchantCityAlternateLanguage: string;
    readonly upiMerchantAccount: string;
    readonly merchantCategoryCode: string;
}

export class IndividualKHQRRequest {

    @IsNotEmpty()
    @IsString()
    readonly bakongAccountID: string;
    @IsNotEmpty()
    @IsString()
    readonly merchantName: string;
    @IsNotEmpty()
    @IsString()
    readonly merchantCity: string;
    @IsEnum(Currency)
    readonly currency: Currency = Currency.USD;
    readonly amount: number = 0.00;
    readonly expirationTimestamp: number;
    @Type(() => OptionalParam)
    @IsOptional()
    readonly optional: OptionalParam = new OptionalParam();

    constructor(
        bakongAccountID: string,
        merchantName: string,
        merchantCity: string,
        optional?: OptionalParam
    ) {
        this.bakongAccountID = bakongAccountID;
        this.merchantName = merchantName;
        this.merchantCity = merchantCity;
        this.optional = optional ?? new OptionalParam();
    }
}

export class MerchantKHQRRequest extends IndividualKHQRRequest {

    @IsNotEmpty()
    @IsString()
    readonly merchantID: string;
    @IsNotEmpty()
    @IsString()
    readonly acquiringBank: string;

    constructor(
        bakongAccountID: string,
        merchantName: string,
        merchantCity: string,
        merchantID: string,
        acquiringBank: string,
        optional?: OptionalParam
    ) {
        super(bakongAccountID, merchantName, merchantCity, optional);
        this.merchantID = merchantID;
        this.acquiringBank = acquiringBank;
    }
}

export interface KHQRResponse {
    readonly qr: string;
    readonly hash: string;
}