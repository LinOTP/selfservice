import { BehaviorSubject, of } from "rxjs";
import { CustomContentSlotComponent } from "./custom-content-slot.component";
import { CustomContent } from "./custom-content.service";

describe("CustomContentSlotComponent",() => {
  it("should set text for slot if content found",() => {
    const service = new CustomContentServiceStub();
    service.setContent([{slotId: "test-slot", content: "test content"}]);
    const component = new CustomContentSlotComponent("test-slot", service as any);
    expect(component.text).toBe("test content");
  })

  it("should not set text for slot if content not found",() => {
    const service = new CustomContentServiceStub();
    const component = new CustomContentSlotComponent("test-slot", service as any);
    expect(component.text).toBeUndefined();
  })
})


class CustomContentServiceStub {
  private _contents$ = new BehaviorSubject([]);
  contents$ = this._contents$.asObservable();
  contentLoaded$ = of(true);

  setContent(c: CustomContent[]) {
    this._contents$.next(c);
  }
}