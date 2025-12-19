import { Attribute, Component } from "@angular/core";
import { filter, switchMap, take, tap } from "rxjs";
import { CustomContentService, SlotId } from "./custom-content.service";

@Component({
    selector: 'app-custom-content-slot',
    template: `<markdown
  [data]="text">
</markdown>`,
    standalone: false
})
export class CustomContentSlotComponent {
  text?:string | undefined

  constructor(@Attribute("slotId") private slotId:SlotId,  private customContentService:CustomContentService) {
    this._getCustomContent()
  }

  private _getCustomContent() {
    this.customContentService.customContentLoaded$.pipe(
      filter(loaded => loaded),
      switchMap(() => this.customContentService.customContent$),
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