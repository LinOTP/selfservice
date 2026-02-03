import { BreakpointObserver } from "@angular/cdk/layout";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: "root" })
export class BootstrapBreakpointService {
  // Emits 0–5 for current breakpoint
  private _breakpoint$ = new BehaviorSubject<number>(0);
  readonly breakpoint$ = this._breakpoint$.asObservable();

  get currentBreakpoint(): number {
    return this._breakpoint$.value;
  }

  // Bootstrap 5 breakpoints (min-width)
  private BOOTSTRAP_BREAKPOINTS = {
    xxl: "(min-width: 1400px)",
    xl: "(min-width: 1200px)",
    lg: "(min-width: 992px)",
    md: "(min-width: 768px)",
    sm: "(min-width: 576px)",
    xs: "(max-width: 575.98px)", // not official but required for detection
  };

  constructor(private observer: BreakpointObserver) {
    this.observeBootstrapBreakpoints();
  }

  private observeBootstrapBreakpoints(): void {
    const queries = Object.values(this.BOOTSTRAP_BREAKPOINTS);

    this.observer.observe(queries).subscribe((state) => {
      // Evaluate from largest → smallest
      if (state.breakpoints[this.BOOTSTRAP_BREAKPOINTS.xxl]) {
        this._breakpoint$.next(5);
      } else if (state.breakpoints[this.BOOTSTRAP_BREAKPOINTS.xl]) {
        this._breakpoint$.next(4);
      } else if (state.breakpoints[this.BOOTSTRAP_BREAKPOINTS.lg]) {
        this._breakpoint$.next(3);
      } else if (state.breakpoints[this.BOOTSTRAP_BREAKPOINTS.md]) {
        this._breakpoint$.next(2);
      } else if (state.breakpoints[this.BOOTSTRAP_BREAKPOINTS.sm]) {
        this._breakpoint$.next(1);
      } else {
        this._breakpoint$.next(0); // xs
      }
    });
  }
}
