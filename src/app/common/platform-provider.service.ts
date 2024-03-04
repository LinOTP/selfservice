import { Platform } from "@angular/cdk/platform";
import { Injectable } from "@angular/core";

@Injectable()
export class PlatformProviderService {
	get platform(): CurrentPlatform {
		if (this._platform.IOS) return 'ios'
		if (this._platform.ANDROID) return 'android'
		return 'other'
	}

	constructor(private _platform: Platform) { }
}

export type CurrentPlatform = 'ios' | 'android' | 'other'