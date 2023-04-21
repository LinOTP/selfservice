import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingPage } from '@testing/page-helper';

import { MaterialModule } from '@app/material.module';

import { ButtonWaitIndicatorComponent } from './button-wait-indicator.component';

class Page extends TestingPage<ButtonWaitIndicatorComponent> {

  public getSpinner() {
    return this.query('mat-spinner');
  }
}

describe('ButtonWaitIndicatorComponent', () => {
  let component: ButtonWaitIndicatorComponent;
  let fixture: ComponentFixture<ButtonWaitIndicatorComponent>;

  let page: Page;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MaterialModule,
      ],
      declarations: [
        ButtonWaitIndicatorComponent,
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonWaitIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    page = new Page(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a waiting spinner if show input is set', () => {
    component.show = true;
    fixture.detectChanges();
    expect(page.getSpinner()).toBeTruthy();

    component.show = false;
    fixture.detectChanges();
    expect(page.getSpinner()).toBeFalsy();
  });

  it('should not show the waiting spinner by default', () => {
    expect(page.getSpinner()).toBeFalsy();
  });
});
