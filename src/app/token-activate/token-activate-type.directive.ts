import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appTokenActivateType]'
})
export class TokenActivateTypeDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
