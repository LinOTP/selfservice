import { EnvironmentInjector, Type, inject, ɵisPromise as isPromise } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, RouterStateSnapshot } from "@angular/router";
import { Observable, concat, from, isObservable, of } from "rxjs";
import { first, last, switchMap, takeWhile } from "rxjs/operators";

// Copied directly from angular 16 source code.
// https://github.com/angular/angular/blob/main/packages/router/src/utils/functional_guards.ts
// TODO: delete after upgrade to angular 16. It will be part of public API.
export function mapToCanActivate(providers: Array<Type<{ canActivate: CanActivateFn; }>>):
  CanActivateFn[] {
  return providers.map(provider => (...params) => {
    return inject(provider).canActivate(...params);
  });
}

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
          const guardResult = injector.runInContext(
            () => guard(route, state));
          return wrapIntoObservable(guardResult).pipe(first());
        }));
    });

    return concat(...observables).pipe(
      takeWhile(v => v === true, true), last());
  };
}
