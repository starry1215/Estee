import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[slide-func-host]',
})
export class SlideFuncDirective {
  constructor(public viewContainerRef: ViewContainerRef) {
  }
}