import { getPinForm, TokenPinFormLayoutComponent } from "./token-pin-form-layout.component";

describe("TokenPinFormLayoutComponent", () => {
	describe("Form", () => {
		it("should not allow different values for pin and confirmPin", () => {
			const form = getPinForm();
			form.get('pin').setValue('1234');
			form.get('confirmPin').setValue('4321');
			expect(form.errors).toEqual({ pinsDoNotMatch: true });

			form.get('confirmPin').setValue('1234');
			expect(form.errors).toEqual(null);
		})
	})

	describe("Component", () => {
		it("should mark confirmPin as touched when pin changes", () => {
			const component = new TokenPinFormLayoutComponent();
			const form = getPinForm();
			component.form = form;
			form.get('pin').setValue('1234');
			expect(form.get('confirmPin').touched).toEqual(true);
		})
	})
})
