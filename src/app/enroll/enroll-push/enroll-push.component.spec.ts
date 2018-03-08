import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrollPushComponent } from './enroll-push.component';

describe('EnrollPushComponent', () => {
  let component: EnrollPushComponent;
  let fixture: ComponentFixture<EnrollPushComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnrollPushComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollPushComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
