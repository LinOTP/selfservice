import { Component } from "@angular/core";
import { ThemeService, getThemes } from "@app/theme.service";

@Component({
  selector: "app-theme-picker",
  templateUrl: "./theme-picker.component.html",
  styleUrls: ["./theme-picker.component.scss"]
})
export class ThemePickerComponent {
  themes = getThemes();
  selectedTheme$ = this.themeService.theme$;

  constructor(public themeService: ThemeService) { }
}
