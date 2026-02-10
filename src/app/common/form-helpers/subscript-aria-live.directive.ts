import { AfterViewInit, Directive, ElementRef, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appSubscriptAriaLive]',
  standalone: false
})
export class SubscriptAriaLiveDirective implements AfterViewInit, OnDestroy {
  private observer: MutationObserver | null = null;

  constructor(private elementRef: ElementRef<HTMLElement>) { }

  ngAfterViewInit(): void {
    this.updateAriaLive();

    this.observer = new MutationObserver(() => this.updateAriaLive());
    this.observer.observe(this.elementRef.nativeElement, {
      childList: true,
      subtree: true
    });
  }

  private updateAriaLive(): void {
    const hintWrapper = this.elementRef.nativeElement.querySelector('.mat-mdc-form-field-hint-wrapper');
    const errorWrapper = this.elementRef.nativeElement.querySelector('.mat-mdc-form-field-error-wrapper');

    if (hintWrapper) {
      hintWrapper.setAttribute('aria-live', 'off');
    }
    if (errorWrapper) {
      errorWrapper.setAttribute('aria-live', 'assertive');
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
