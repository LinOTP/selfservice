import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguagePickerComponent } from './language-picker.component';
import { MaterialModule } from '../material.module';
import { SystemService } from '../system.service';
import { spyOnClass, getInjectedStub } from '../../testing/spyOnClass';
import { TestingPage } from '../../testing/page-helper';
import { LOCALE_ID } from '@angular/core';
import { By } from '@angular/platform-browser';

const testLocalesList = [
  { id: 'a', name: 'alpha', shortName: 'A' },
  { id: 'b', name: 'beta', shortName: 'B' },
];

class Page extends TestingPage<LanguagePickerComponent> {

  public getButton() {
    return this.query('.mat-button');
  }

  public getDropdownItems() {
    return this.fixture.debugElement.queryAll(By.css('.mat-menu-item'));
  }
}

describe('LanguagePickerComponent', () => {
  let component: LanguagePickerComponent;
  let fixture: ComponentFixture<LanguagePickerComponent>;
  let systemService: jasmine.SpyObj<SystemService>;
  let page: Page;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
      ],
      declarations: [
        LanguagePickerComponent
      ],
      providers: [
        {
          provide: SystemService,
          useValue: spyOnClass(SystemService)
        },
        {
          provide: LOCALE_ID,
          useValue: 'a'
        },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LanguagePickerComponent);
    component = fixture.componentInstance;

    systemService = getInjectedStub(SystemService);
    systemService.getLocales.and.returnValue(testLocalesList);

    page = new Page(fixture);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the currently selected locale', () => {
    expect(page.getButton().innerText).toMatch(/language A/);
  });

  it('should show all available locales in a menu', () => {
    page.getButton().click();

    fixture.detectChanges();

    expect(page.getDropdownItems().length).toBe(testLocalesList.length);
    expect(page.getDropdownItems().map(i => i.nativeElement.innerText)).toEqual(['alpha (A)', 'beta (B)']);
  });
});
