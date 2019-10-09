import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appFocusOnInit]'
})
export class FocusOnInitDirective implements OnInit {

  constructor(
    private el: ElementRef,
  ) { }

  ngOnInit() {
    if (!this.el.nativeElement.focus) {
      throw new Error('Element does not accept focus.');
    } else {
      window.setTimeout(() => {
        this.el.nativeElement.focus();
      });
    }
  }
}
