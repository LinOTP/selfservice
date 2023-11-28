import { TestBed } from "@angular/core/testing";
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from "@angular/router";
import { Observable, of } from "rxjs";
import { runGuardsSerially } from "./run-guards-serially";

describe("RunGuardsSerially", () => {
  it("should call guard when only one provided", (done) => {
    const guardSpy = jasmine.createSpy("guard", mockGuard).and.returnValue(of(true));

    TestBed.runInInjectionContext(() => {
      const guard = runGuardsSerially([guardSpy]);
      const result = guard({} as any, {} as any) as Observable<boolean>;
      result.subscribe(
        {
          next: (value) => {
            expect(value).toEqual(true);
          },
          complete: () => {
            expect(guardSpy).toHaveBeenCalled();
            done();
          }
        }
      );
    });
  });

  it("should call all guards when all return true", (done) => {
    const guardSpy1 = jasmine.createSpy("guard1", mockGuard).and.returnValue(of(true));
    const guardSpy2 = jasmine.createSpy("guard2", mockGuard).and.returnValue(of(true));
    const guardSpy3 = jasmine.createSpy("guard3", mockGuard).and.returnValue(of(true));

    TestBed.runInInjectionContext(() => {
      const guard = runGuardsSerially([guardSpy1, guardSpy2, guardSpy3]);

      const result$ = guard({} as any, {} as any) as Observable<boolean>;
      const resultValue = [];
      result$.subscribe({
        next: (value) => resultValue.push(value),
        complete: () => {
          expect(guardSpy1).toHaveBeenCalled();
          expect(guardSpy2).toHaveBeenCalled();
          expect(guardSpy3).toHaveBeenCalled();
          expect(resultValue.length).toEqual(1);
          expect(resultValue).toEqual([true]);
          done();
        }
      });
    });
  });

  it("should not call next guard when previous returns false", (done) => {
    const guardSpy1 = jasmine.createSpy("guard1", mockGuard).and.returnValue(of(false));
    const guardSpy2 = jasmine.createSpy("guard2", mockGuard).and.returnValue(of(true));
    const guardSpy3 = jasmine.createSpy("guard3", mockGuard).and.returnValue(of(true));

    TestBed.runInInjectionContext(() => {
      const guard = runGuardsSerially([guardSpy1, guardSpy2, guardSpy3]);
      const result$ = guard({} as any, {} as any) as Observable<boolean>;

      const resultValue = [];
      result$.subscribe({
        next: (value) => resultValue.push(value),
        complete: () => {
          expect(guardSpy1).toHaveBeenCalled();
          expect(guardSpy2).not.toHaveBeenCalled();
          expect(guardSpy3).not.toHaveBeenCalled();
          expect(resultValue).toEqual([false]);
          done();
        }
      });
    });
  });

  it("should accept non observable return values", (done) => {
    const guardSpy1 = jasmine.createSpy("guard1", mockGuard).and.returnValue(true);
    const guardSpy2 = jasmine.createSpy("guard2", mockGuard).and.returnValue(false);
    const guardSpy3 = jasmine.createSpy("guard3", mockGuard).and.returnValue(true);
    TestBed.runInInjectionContext(() => {
      const guard = runGuardsSerially([guardSpy1, guardSpy2, guardSpy3]);
      const result = guard({} as any, {} as any) as Observable<boolean>;

      result.subscribe({
        complete: () => {
          expect(guardSpy1).toHaveBeenCalled();
          expect(guardSpy2).toHaveBeenCalled();
          expect(guardSpy3).not.toHaveBeenCalled();
          done();
        }
      });
    });
  });
});

const mockGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> => {
  return of(false);
};