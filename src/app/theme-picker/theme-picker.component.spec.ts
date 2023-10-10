import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CommonModule } from '@angular/common';
import { Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ThemeService } from '@app/theme.service';
import { ThemePickerComponent } from './theme-picker.component';

describe('ThemePicker', () => {
  let component: ThemePickerComponent;
  let fixture: ComponentFixture<ThemePickerComponent>;
  let themeService: ThemeService;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatMenuModule,
        NoopAnimationsModule,
        MatButtonModule,
        MatIconModule,
      ],
      declarations: [ThemePickerComponent],
      providers: [
        {
          provide: ThemeService,
          useClass: ThemeServiceMock,
        },
      ],
    }).compileComponents();
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(ThemePickerComponent);
    component = fixture.componentInstance;

    themeService = TestBed.inject(ThemeService);
    localStorage.clear();
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select theme when clicked on button in menu', async () => {
    const menu = await loader.getHarness(MatMenuHarness);
    const triggerBtn = await loader.getHarness(MatButtonHarness);

    await menu.open();
    let items = await menu.getItems();
    expect(items.length).toBe(2);

    await items[1].click();
    let buttonText = await triggerBtn.getText();
    expect(buttonText).toContain('dark');
    expect(themeService.theme).toBe('dark');

    await menu.open();
    items = await menu.getItems();
    await items[0].click();

    buttonText = await triggerBtn.getText();
    expect(buttonText).toContain('light');
    expect(themeService.theme).toBe('light');
  });
});

@Injectable()
class ThemeServiceMock extends ThemeService {
  protected override isDarkModePreferred(): boolean {
    return false;
  }
}
