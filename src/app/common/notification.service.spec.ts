import { inject, TestBed } from '@angular/core/testing';

import { MaterialModule } from '@app/material.module';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
      ],
      providers: [
        NotificationService,
      ]
    });
  });

  it('should be created', inject([NotificationService], (service: NotificationService) => {
    expect(service).toBeTruthy();
  }));
});
