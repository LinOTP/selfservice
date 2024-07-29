import { HttpClient } from "@angular/common/http";
import { Inject, Injectable, LOCALE_ID } from "@angular/core";
import { localeToLanguage } from "../common/locale-utils";

@Injectable(
  {providedIn: 'root'}
)
export class CustomAssetsService {
  constructor(private http:HttpClient, @Inject(LOCALE_ID) private readonly locale: string) {}

  getCustomContentFile() {
    const locale = localeToLanguage(this.locale)
    const fileName = `assets/custom-content/content.${locale}.yaml`;
    return this.http.get(fileName, {responseType: 'text'});
  }
}