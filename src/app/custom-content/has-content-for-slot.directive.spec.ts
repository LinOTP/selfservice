import { NgIf } from "@angular/common";
import { Component, Directive, inject, Input } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BehaviorSubject, of } from "rxjs";
import { CustomContent, CustomContentService } from "./custom-content.service";
import { HasContentForSlotDirective } from "./has-content-for-slot.directive";

describe("HasContentForSlotDirective", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  beforeEach(async() => {
    TestBed.configureTestingModule({
      declarations: [TestHostComponent],
      imports:[HasContentForSlotDirective],
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
  template: `<div *appHasContentForSlot="'test-slot'" class="test-content">Test Element</div>`
})
class TestHostComponent {}

class CustomContentServiceStub {
  private _contents$ = new BehaviorSubject([]);
  contents$ = this._contents$.asObservable();
  contentLoaded$ = of(true);

  setContent(c: CustomContent[]) {
    this._contents$.next(c);
  }
}

//mock for other components that will use the directive
@Directive({
  selector: '[appHasContentForSlot]',
  hostDirectives: [{
     directive: NgIf,
     inputs: ['ngIfElse: appHasContentForSlotElse'] },
  ],
  standalone: true,
})
export class HasContentForSlotMockDirective {
  @Input("appHasContentForSlot") slotId: string;
  private ngIfDirective = inject(NgIf);

  constructor() {
    this.ngIfDirective.ngIf = true;
  }
}
