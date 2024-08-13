import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { RouterModule } from "@angular/router";
import { Subscription } from "rxjs";
import { CustomContentService, CustomPage } from "./custom-content.service";

@Component({
  selector: 'app-custom-page-link',
  template: `<a mat-button
  routerLinkActive="active-link"
  [routerLink]="'/'+ page.route" *ngIf="page">{{page.title}}</a>`,
  standalone: true,
  imports:[
    CommonModule,
    MatButtonModule,
    RouterModule
  ]
})
export class CustomPageLinkComponent implements OnInit, OnDestroy {
  page?:CustomPage
  private _subscription?:Subscription
  constructor(private customContentService:CustomContentService) {}

  ngOnInit() {
    this._subscription = this.customContentService.page$.subscribe(page => {
      this.page = page
    })
  }

  ngOnDestroy() {
    this._subscription?.unsubscribe()
  }
}