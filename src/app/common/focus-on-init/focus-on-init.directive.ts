import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appFocusOnInit]',
  standalone: true
})
export class FocusOnInitDirective implements AfterViewInit {
  @Input() focusDelay: number = 0;

  /**
   * Enables/disables focusing. Supports:
   *   <input appFocusOnInit>                -> enabled (true)
   *   <input [appFocusOnInit]="true">       -> enabled (true)
   *   <input [appFocusOnInit]="false">      -> disabled (false)
   */
  @Input()
  set appFocusOnInit(value: boolean | string | null | undefined) {
    // Presence-only attribute (`""`) means enabled; otherwise coerce to boolean
    this.enabled = value === '' ? true : coerceBooleanProperty(value);
  }
  private enabled = true;

  constructor(
    private el: ElementRef,
  ) { }

  ngAfterViewInit() {
    if (!this.enabled) return;
    if (!this.el.nativeElement.focus) {
      throw new Error('Element does not accept focus.');
    } else {
      window.setTimeout(() => {
        this.el.nativeElement.focus();
      }, this.focusDelay);
    }
  }
}
