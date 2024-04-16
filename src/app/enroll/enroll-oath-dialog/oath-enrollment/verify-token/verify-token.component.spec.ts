import { fakeAsync, tick } from "@angular/core/testing";
import { delay, of } from "rxjs";
import { getVerifyForm } from "../import-token-step/import-token-step.component";
import { VerifyTokenComponent } from "./verify-token.component";

describe("VerifyTokenComponent", () => {
  describe("Component tests", () => {
    it("should start verify process", () => {
      const testService = new TestServiceMock();
      const notificationsService = new NotificationServiceMock();
      testService.response = { transactionId: "test-transaction-id" };

      const component = new VerifyTokenComponent(testService as any, notificationsService as any);
      expect(component.verifyStarted).toEqual(false);

      component.token = { serial: "test-serial" } as any;
      expect(component.transactionDetail.transactionId).toEqual("test-transaction-id");
      expect(component.verifyStarted).toEqual(true);
    })

    it("should show error message when start of 'token test' fails", () => {
      const testService = new TestServiceMock();
      const notificationsService = new NotificationServiceMock();
      testService.response = null;

      const component = new VerifyTokenComponent(testService as any, notificationsService as any);
      expect(component.verifyStarted).toEqual(false);

      component.token = { serial: "test-serial" } as any;
      expect(component.verifyResult).toEqual("FAILURE");
      expect(component.verifyStarted).toEqual(true);
    })

    it("should verify token if form valid", () => {
      const testService = new TestServiceMock();
      const notificationsService = new NotificationServiceMock();
      testService.response = { transactionId: "test-transaction-id" };

      const component = new VerifyTokenComponent(testService as any, notificationsService as any);
      component.token = { serial: "test-serial" } as any;
      component.form = getVerifyForm();
      testService.calledParams = null;

      component.verifyToken();
      expect(component.form.valid).toEqual(false);
      expect(testService.calledParams).toEqual(null);

      component.form.get("otp").setValue("1234");
      expect(component.form.valid).toEqual(true);
      component.verifyToken();
      expect(testService.calledParams).toEqual({ serial: "test-serial", otp: "1234", transactionid: "test-transaction-id" });
    })

    it("should allow only numeric values in OTP field", () => {
      const testService = new TestServiceMock();
      const notificationsService = new NotificationServiceMock();
      testService.response = { transactionId: "test-transaction-id" };

      const component = new VerifyTokenComponent(testService as any, notificationsService as any);
      component.token = { serial: "test-serial" } as any;
      component.form = getVerifyForm();
      testService.calledParams = null;

      component.form.get("otp").setValue("1234");
      expect(component.form.valid).toEqual(true);

      component.form.get("otp").setValue("1234a");
      expect(component.form.valid).toEqual(false);

      component.form.get("otp").setValue("123 4");
      expect(component.form.valid).toEqual(false);
    })

    it("should correctly handle successful token verification", fakeAsync(() => {
      const testService = new TestServiceMock();
      const notificationsService = new NotificationServiceMock();
      testService.response = { transactionId: "test-transaction-id" };

      const component = new VerifyTokenComponent(testService as any, notificationsService as any);
      component.token = { serial: "test-serial" } as any;
      component.form = getVerifyForm();
      component.form.get("otp").setValue("1234");
      testService.async = true;

      component.verifyToken();

      expect(component.awaitingResponse).toEqual(true);

      let tokenVerified = false
      component.tokenVerified.subscribe(result => {
        tokenVerified = result;
      })

      tick(1);
      expect(component.verifyResult).toEqual("SUCCESS");
      expect(component.awaitingResponse).toEqual(false);
      expect(component.form.disabled).toBeTrue();
      expect(notificationsService.messageCalledParams).toBeTruthy();
      expect(tokenVerified).toBeTrue();
    }))

    it("should correctly handle failed token verification", fakeAsync(() => {
      const testService = new TestServiceMock();
      const notificationsService = new NotificationServiceMock();
      testService.response = { transactionId: "test-transaction-id" };

      const component = new VerifyTokenComponent(testService as any, notificationsService as any);
      component.token = { serial: "test-serial" } as any;
      component.form = getVerifyForm();
      component.form.get("otp").setValue("1234");
      testService.async = true;
      testService.response = false;

      component.verifyToken();

      expect(component.awaitingResponse).toEqual(true);

      tick(1);
      expect(component.verifyResult).toEqual("FAILURE");
      expect(component.awaitingResponse).toEqual(false);
      expect(component.form.disabled).toBeFalse();
      expect(notificationsService.errorMessageParams).toBeTruthy();
    }))
  })
})


class NotificationServiceMock {
  messageCalledParams = null
  errorMessageParams = null
  errorMessage(params: string) {
    this.errorMessageParams = params;
  }
  message(params: string) {
    this.messageCalledParams = params;
  }
}

class TestServiceMock {
  calledParams: any = null
  response: any = {}
  async = false;
  testToken(params: any) {
    this.calledParams = params;
    if (this.async) {
      return of(this.response).pipe(delay(1));
    }
    return of(this.response);
  }
}

