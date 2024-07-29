import { NgIf } from "@angular/common";
import { Directive, Input, OnDestroy, inject } from "@angular/core";
import { Subscription, tap } from "rxjs";
import { CustomContentService } from "./custom-content.service";

@Directive({
  selector: '[appHasContentForSlot]',
  hostDirectives: [{
     directive: NgIf,
     inputs: ['ngIfElse: appHasContentForSlotElse'] },
  ],
  standalone: true,
})
export class HasContentForSlotDirective implements OnDestroy {
  @Input("appHasContentForSlot")
  public set slotId(value: string) {
    this._slotId = value;
    this.subscription?.unsubscribe();
    this.subscribeToCustomContentChanges();
  }
  public get slotId(): string {
    return this._slotId;
  }
  private  _slotId: string;
  private ngIfDirective = inject(NgIf);
  private subscription?: Subscription

  constructor(private contentsService: CustomContentService) {
    this.ngIfDirective.ngIf = false;
  }

  private subscribeToCustomContentChanges() {
    this.subscription = this.contentsService.contents$.pipe(
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