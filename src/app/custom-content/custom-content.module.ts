import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MarkdownModule } from "ngx-markdown";
import { CustomContentSlotComponent } from "./custom-content-slot.component";
import { CustomPageLinkComponent } from "./custom-page-link.component";
import { CustomPageComponent } from "./custom-page.component";
import { HasCustomContentDirective } from "./has-custom-content.directive";

@NgModule({
  declarations: [
    CustomContentSlotComponent,
    CustomPageComponent
  ],
  imports: [
    CommonModule,
    MarkdownModule.forChild(),
    HasCustomContentDirective,
    CustomPageLinkComponent
  ],
  exports: [
    CustomContentSlotComponent,
    HasCustomContentDirective,
    CustomPageComponent,
    CustomPageLinkComponent
  ]
})
export class CustomContentModule {}