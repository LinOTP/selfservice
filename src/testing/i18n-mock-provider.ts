import { I18n, I18nDef } from '@ngx-translate/i18n-polyfill';

export const I18nMock = {
  provide: I18n,
  useValue: (def: string | I18nDef) => typeof def === 'object' ? def.value : def
};
