import { Directive, OnDestroy, OnInit } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { map, Subject, takeUntil } from 'rxjs';
import { BootstrapBreakpointService } from './bootstrap-breakpoints.service';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'mat-horizontal-stepper[responsiveOrientation]',
  standalone: true
})
export class ResponsiveStepperDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private stepper: MatStepper,
    private breakpointService: BootstrapBreakpointService
  ) { }

  ngOnInit(): void {
    this.breakpointService.breakpoint$
      .pipe(
        map(current => current >= 2),
        takeUntil(this.destroy$)
      )
      .subscribe(isAboveBreakpoint => {
        this.stepper.orientation = isAboveBreakpoint ? 'horizontal' : 'vertical';
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
