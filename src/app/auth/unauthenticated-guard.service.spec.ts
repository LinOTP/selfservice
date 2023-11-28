import { UnauthenticatedGuard } from "./unauthenticated-guard.service";

describe("UnauthenticatedGuard", () => {
  let cut: UnauthenticatedGuard;
  let sessionService: SessionServiceStub;
  let router: RouterStub;

  beforeEach(() => {
    sessionService = new SessionServiceStub();
    router = new RouterStub();
    cut = new UnauthenticatedGuard(sessionService as any, router as any);
    spyOn(router, "navigate");
  });

  it("should be created", () => {
    expect(cut).toBeTruthy();
  });

  it("it should return false if user is logged in", (done) => {
    cut.canActivate({} as any, {} as any).subscribe(result => {
      expect(result).toBeFalse();
      done();
    });
  });

  it("it should return true if user is not logged in", (done) => {
    sessionService.result = false;
    cut.canActivate({} as any, {} as any).subscribe(result => {
      expect(result).toBeTrue();
      done();
    });
  });

  it("it should redirect to route in query params if user is logged in", (done) => {
    cut.canActivate({ queryParams: { redirect: "/test" } } as any, {} as any).subscribe(result => {
      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(["/test"]);
      done();
    });
  });

  it("it should redirect to home if no route in query params", (done) => {
    cut.canActivate({} as any, {} as any).subscribe(result => {
      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(["/home"]);
      done();
    });
  });

});


class SessionServiceStub {
  result = true;

  public isLoggedIn() {
    return this.result;
  }
}

class RouterStub {
  public navigate(params: any) { }
}