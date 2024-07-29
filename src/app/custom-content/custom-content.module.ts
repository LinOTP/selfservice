import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MarkdownModule } from "ngx-markdown";
import { CustomContentSlotComponent } from "./custom-content-slot.component";
import { HasContentForSlotDirective } from "./has-content-for-slot.directive";

@NgModule({
  declarations: [
    CustomContentSlotComponent
  ],
  imports: [
    CommonModule,
    MarkdownModule.forChild(),
    HasContentForSlotDirective,
  ],
  exports: [
    CustomContentSlotComponent,
    HasContentForSlotDirective,
  ]
})
export class CustomContentModule {}