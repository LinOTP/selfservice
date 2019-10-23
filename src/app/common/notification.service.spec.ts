import { TestBed, inject } from '@angular/core/testing';

import { I18nMock } from '../../testing/i18n-mock-provider';

import { MaterialModule } from '../material.module';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
      ],
      providers: [
        NotificationService,
        I18nMock,
      ]
    });
  });

  it('should be created', inject([NotificationService], (service: NotificationService) => {
    expect(service).toBeTruthy();
  }));
});
