import { Injectable } from "@angular/core";
import { TokenType } from "@app/api/token";
import { BehaviorSubject } from "rxjs";

export interface AppRecommendation {
  type: TokenType,
  android: CustomAppContent,
  ios: CustomAppContent
}
export interface CustomAppContent {
  name: string,
  url: string
}

export const DEFAULT_IOS_APP: CustomAppContent = {
  name: "LinOTP Authenticator",
  url: "https://apps.apple.com/de/app/linotp-authenticator/id6450118468"
};

export const DEFAULT_ANDROID_APP: CustomAppContent = {
  name: "LinOTP Authenticator",
  url: "https://play.google.com/store/apps/details?id=de.linotp.authenticator"
};

@Injectable(
  {providedIn: 'root'}
)
export class AppRecommendationService {
    private appRecs: BehaviorSubject<AppRecommendation[]> = new BehaviorSubject([]);

    public getAppRecommendationFor(type: TokenType): AppRecommendation {
      const supportedTypes = [TokenType.HOTP, TokenType.TOTP, TokenType.QR, TokenType.PUSH]
      const defaultRec: AppRecommendation = {type: type, android: DEFAULT_ANDROID_APP, ios: DEFAULT_IOS_APP};
      if(!supportedTypes.includes(type)){
        return defaultRec
      }
        return this.getAppRecommendations().find(v => v.type === type) ?? defaultRec;
    }

    public setAppRecommendations(appRecs: AppRecommendation[]){
        this.appRecs.next(appRecs)
    }

    public getAppRecommendations(): AppRecommendation[]{
        return this.appRecs.getValue()
    }

}