import { NgIf } from "@angular/common";
import { Directive, Inject, Input } from "@angular/core";

//mock for other components that will use the directive
@Directive({
  selector: '[appHasCustomContent]',
  hostDirectives: [{
     directive: NgIf,
     inputs: ['ngIfElse: appHasCustomContentElse'] },
  ],
  standalone: true,
})
export class HasCustomContentMockDirective {
  @Input("appHasCustomContent") slotId: string;
  private ngIfDirective = Inject(NgIf);

  constructor() {
    this.ngIfDirective.ngIf = true;
  }
}