import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MockComponent } from "@testing/mock-component";
import { PlatformProviderService } from "../platform-provider.service";
import { AuthenticatorLinksComponent } from "./authenticator-links.component";

describe("AuthenticatorLinksComponent", () => {
	let component: AuthenticatorLinksComponent;
	let fixture: ComponentFixture<AuthenticatorLinksComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			providers: [PlatformProviderService],
			imports: [AuthenticatorLinksComponent],
			declarations: [
				MockComponent({ selector: "qrcode", inputs: ["qrdata", "width", "errorCorrectionLevel", "margin"] }),
			]
		}).compileComponents();
	})

	beforeEach(() => {
		fixture = TestBed.createComponent(AuthenticatorLinksComponent);
		component = fixture.componentInstance;
	})

	it("should create", () => {
		expect(component).toBeTruthy();
	})

	it("should display all platforms when on desktop", () => {
		component.platform = "other";
		fixture.detectChanges();
		const allPlatformsContainer = fixture.nativeElement.querySelectorAll(".all-platforms-container");
		const mobileContainer = fixture.nativeElement.querySelectorAll(".mobile-container");
		expect(allPlatformsContainer.length).toBeTruthy();
		expect(mobileContainer.length).toBeFalsy();
	})

	it("should display mobile container on ios and android", () => {
		component.platform = "ios";
		fixture.detectChanges();
		let allPlatformsContainer = fixture.nativeElement.querySelectorAll(".all-platforms-container");
		let mobileContainer = fixture.nativeElement.querySelectorAll(".mobile-container");
		let iosBadge = fixture.nativeElement.querySelector(".app-store-badge");
		let androidBadge = fixture.nativeElement.querySelector(".google-play-badge");

		expect(allPlatformsContainer.length).toBeFalsy();
		expect(mobileContainer.length).toBeTruthy();
		expect(iosBadge).toBeTruthy();
		expect(androidBadge).toBeFalsy();

		component.platform = "android";
		fixture.detectChanges();
		allPlatformsContainer = fixture.nativeElement.querySelectorAll(".all-platforms-container");
		mobileContainer = fixture.nativeElement.querySelectorAll(".mobile-container");
		iosBadge = fixture.nativeElement.querySelector(".app-store-badge");
		androidBadge = fixture.nativeElement.querySelector(".google-play-badge");

		expect(allPlatformsContainer.length).toBeFalsy();
		expect(mobileContainer.length).toBeTruthy();
		expect(iosBadge).toBeFalsy();
		expect(androidBadge).toBeTruthy();
	})

	it("should display all platforms on mobile when show show is on", () => {
		component.platform = "ios";
		component.showDetails = true;
		fixture.detectChanges();
		let allPlatformsContainer = fixture.nativeElement.querySelectorAll(".all-platforms-container");
		let mobileContainer = fixture.nativeElement.querySelectorAll(".mobile-container");
		expect(allPlatformsContainer.length).toBeTruthy();
		expect(mobileContainer.length).toBeTruthy();

		component.showDetails = false;
		fixture.detectChanges();
		allPlatformsContainer = fixture.nativeElement.querySelectorAll(".all-platforms-container");
		mobileContainer = fixture.nativeElement.querySelectorAll(".mobile-container");
		expect(allPlatformsContainer.length).toBeFalsy();
		expect(mobileContainer.length).toBeTruthy();
	})
});