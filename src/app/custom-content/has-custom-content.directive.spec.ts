import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BehaviorSubject, of } from "rxjs";
import { CustomContentService, SlotContent } from "./custom-content.service";
import { HasCustomContentDirective } from "./has-custom-content.directive";

describe("HasCustomContentDirective", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  beforeEach(async() => {
    TestBed.configureTestingModule({
      declarations: [TestHostComponent],
      imports:[HasCustomContentDirective],
      providers: [
        {provide:CustomContentService, useClass:CustomContentServiceStub}
      ]
    }).compileComponents();
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
  })

  it('should render element when there is content for slot', () => {
    const contentService = TestBed.inject(CustomContentService);
    (contentService as any).setContent([{slotId: "test-slot", content: "test content"}]);
    fixture.detectChanges();
    const directiveEl = fixture.debugElement.query(By.css(".test-content"));
    expect(directiveEl).toBeTruthy();
  });

  it('should not render element when there is no content for slot', () => {
    fixture.detectChanges();
    const directiveEl = fixture.debugElement.query(By.css(".test-content"));
    expect(directiveEl).toBeFalsy();
  });
})


@Component({
  template: `<div *appHasCustomContent="'test-slot'" class="test-content">Test Element</div>`
})
class TestHostComponent {}

class CustomContentServiceStub {
  private _contents$ = new BehaviorSubject([]);
  customContent$ = this._contents$.asObservable();
  customContentLoaded$ = of(true);

  setContent(c: SlotContent[]) {
    this._contents$.next(c);
  }
}