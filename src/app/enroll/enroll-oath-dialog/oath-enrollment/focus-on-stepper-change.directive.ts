import { Directive, ElementRef, Input } from "@angular/core";
import { MatStepper } from "@angular/material/stepper";

@Directive({
    selector: '[appFocusOnStepperChange]',
    standalone: false
})
export class FocusOnStepperChangeDirective {
	@Input('appFocusOnStepperChange') stepNumber: number

	constructor(private stepper: MatStepper, private el: ElementRef) {
		this.stepper.selectionChange.subscribe((changeEvent) => {
			if (this.stepNumber && (changeEvent.selectedIndex === this.stepNumber)) {
				//waiting for stepper animation to finish
				setTimeout(() => {
					this.el.nativeElement?.focus();
				}, 500)
			}
		});
	}
}