import { of } from "rxjs";
import { LockableTokenActionsService } from "./lockable-token-dialogs.service";

describe("LockableTokenDialogsService", () => {
    it("should return unassign dialog result when user cannot enable token", (done: DoneFn) => {
        const cut = getService(false);
        (cut.getDisableConfirmation({} as any, false)).subscribe((result) => {
            expect(result).toBeFalse();
            done();
        })
    })

    it("should return operations service result when user can enable token", (done: DoneFn) => {
        const cut = getService(false);
        (cut.getDisableConfirmation({} as any, true)).subscribe((result) => {
            expect(result).toBe(true);
            expect((cut as any).operationsService.called).toBeTrue();
            done();
        })
    })

    it("should return unassign dialog result when confirmation needed", (done: DoneFn) => {
        const cut = getService(true);
        (cut.getDisableConfirmation({} as any, true)).subscribe((result) => {
            expect(result).toBe(false);
            done();
        })
    })
});


function getService(willLock: boolean): LockableTokenActionsService {
    const dialog = {
        open: () => ({
            // returning false means that we get result from dialog
            afterClosed: () => of(false)
        })
    } as any
    const cut = new LockableTokenActionsService(dialog, null, [] as any, null, new OperationsServiceStub(true) as any);
    (cut as any).getLockingEvaluator = () => ({
        checkDisableWillLockAuth: () => willLock,
        isUsersAuthLocked: () => false
    });
    return cut;
}

class OperationsServiceStub {
    called = false
    constructor(public result: boolean) { }
    disable(token: any) {
        this.called = true;
        return of(this.result);
    }
}