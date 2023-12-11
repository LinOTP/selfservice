import { EnvironmentInjector, inject, ɵisPromise as isPromise, runInInjectionContext } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, RouterStateSnapshot } from "@angular/router";
import { Observable, concat, from, isObservable, of } from "rxjs";
import { first, last, switchMap, takeWhile } from "rxjs/operators";

// Copied directly from angular source code.
// https://github.com/angular/angular/blob/main/packages/router/src/utils/collection.ts
function wrapIntoObservable<T>(value: T | Promise<T> | Observable<T>): Observable<T> {
  if (isObservable(value)) {
    return value;
  }

  if (isPromise(value)) {
    return from(Promise.resolve(value));
  }

  return of(value);
}

export function runGuardsSerially(guards: CanActivateFn[] |
  CanActivateChildFn[]):
  CanActivateFn | CanActivateChildFn {
  return (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) => {
    const injector = inject(EnvironmentInjector);
    const observables = guards.map(guard => {
      return of({}).pipe(
        switchMap(() => {
          const guardResult = runInInjectionContext(injector,
            () => guard(route, state));
          return wrapIntoObservable(guardResult).pipe(first());
        }));
    });

    return concat(...observables).pipe(
      takeWhile(v => v === true, true), last());
  };
}
