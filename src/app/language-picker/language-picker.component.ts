import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';

import { SystemService } from '@app/system.service';

@Component({
  selector: 'app-language-picker',
  templateUrl: './language-picker.component.html',
  styleUrls: ['./language-picker.component.scss']
})
export class LanguagePickerComponent implements OnInit {

  public locales: { id: string, name: string, shortName: string }[];

  public get selectedLocale() {
    const baseLanguageCode = this.selectedLocaleId.split('-')[0];
    return this.locales.find(l => l.id === baseLanguageCode);
  }

  constructor(
    @Inject(LOCALE_ID) private readonly selectedLocaleId: string,
    private systemService: SystemService,
  ) { }

  ngOnInit() {
    this.locales = this.systemService.getLocales();
  }

}
