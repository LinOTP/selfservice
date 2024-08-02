import { Attribute, Component } from "@angular/core";
import { filter, switchMap, take, tap } from "rxjs";
import { CustomContentService } from "./custom-content.service";

@Component({
  selector: 'app-custom-content-slot',
  template: `<markdown
  [data]="text">
</markdown>`
})
export class CustomContentSlotComponent {
  text?:string | undefined

  constructor(@Attribute("slotId") private slotId,  private customContentSlotsService:CustomContentService) {
    this._getCustomContent()
  }

  private _getCustomContent() {
    this.customContentSlotsService.contentLoaded$.pipe(
      filter(loaded => loaded),
      switchMap(() => this.customContentSlotsService.contents$),
      tap(contents => {
          const contentForSlot = contents.find(c => c.slotId === this.slotId);
          if(contentForSlot) {
            this.text = contentForSlot.content
          }
      }),
      take(1)
    ).subscribe()
  }
}