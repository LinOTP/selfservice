import { NgIf } from "@angular/common";
import { Directive, Input, OnDestroy, inject } from "@angular/core";
import { Subscription, tap } from "rxjs";
import { CustomContentService, SlotId } from "./custom-content.service";

@Directive({
  selector: '[appHasCustomContent]',
  hostDirectives: [{
     directive: NgIf,
     inputs: ['ngIfElse: appHasCustomContentElse'] },
  ],
  standalone: true,
})
export class HasCustomContentDirective implements OnDestroy {
  @Input("appHasCustomContent")
  public set slotId(value: SlotId) {
    this._slotId = value;
    this.subscription?.unsubscribe();
    this.subscribeToCustomContentChanges();
  }
  public get slotId(): SlotId {
    return this._slotId;
  }
  private  _slotId: SlotId
  private ngIfDirective = inject(NgIf);
  private subscription?: Subscription

  constructor(private contentsService: CustomContentService) {
    this.ngIfDirective.ngIf = false;
  }

  private subscribeToCustomContentChanges() {
    this.subscription = this.contentsService.customContent$.pipe(
      tap(contents => {
          const content = contents.find(c => c.slotId === this.slotId);
          this.ngIfDirective.ngIf = !!content && content.content
        }),
    ).subscribe()
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}