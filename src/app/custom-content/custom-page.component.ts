import { Component } from "@angular/core";

@Component({
  selector: 'app-custom-page',
  template: `<app-custom-content-slot slotId="custom-page" class="custom-content-slot custom-content-slot-custom-page"></app-custom-content-slot>`
})
export class CustomPageComponent {}