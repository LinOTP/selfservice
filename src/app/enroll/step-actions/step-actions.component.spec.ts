import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepActionsComponent } from './step-actions.component';
import { NgSelfServiceCommonModule } from "@common/common.module";

describe('CreateTokenActionsComponent', () => {
  let component: StepActionsComponent;
  let fixture: ComponentFixture<StepActionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StepActionsComponent],
      imports: [NgSelfServiceCommonModule]
    });
    fixture = TestBed.createComponent(StepActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
