import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { filter, map, shareReplay, startWith, tap } from 'rxjs/operators';

import { LinOTPResponse } from '@api/api';
import { Permission, PoliciesToPermissionsMapping } from '@common/permissions';

import { SessionService } from './auth/session.service';

/**
 * Interface that provides available information about the system.
 *
 * Some examples are the linotp version, available realms and login information.
 *
 * Another interface UserSystemInfo is available that also contains information of
 * the logged in user. It extends this interface.
 *
 * @export
 * @interface SystemInfo
 */
export interface SystemInfo {
  copyright: string;
  version: string;
  realms: {
    [realmName: string]: {
      realmname: string,
      default: boolean,
    }
  };
  settings: {
    autoassign: boolean;
    default_realm: string;
    mfa_login: boolean;
    realm_box: boolean;
    mfa_3_fields: boolean;
    autoenroll: boolean;
    footer_text?: string;
    imprint_url?: string;
    privacy_notice_url?: string;
    otp_pin_minlength?: number;
    otp_pin_maxlength?: number;
    otp_pin_contents?: string;
    token_limits: TokenLimitResponse
  };
}

export interface UserInfo {
  username: string;
  userid: string;
  realm: string;
  description: string;
  phone: string;
  mobile: string;
  email: string;
  givenname: string;
  surname: string;
  gender: string;
}

export type MaxTokenResponse = {
  max_token: number;
  token_count: number;
}

type MaxTokenTypeResponse = {
  token_type: string
  max_token: number;
}

export type TokenLimitResponse = {
  all_token: number | null;
  token_types: MaxTokenTypeResponse[];
}


/**
 * Interface that provides available information about the system and the user.
 *
 * It extends the SystemInfo interface with additional information about the
 * logged in user.
 *
 * @export
 * @interface UserSystemInfo
 * @extends {SystemInfo}
 */
export interface UserSystemInfo extends SystemInfo {
  permissions: Permission[];
  user: UserInfo;
  settings: SystemInfo['settings'] & {
    edit_sms?: number,
    edit_email?: number,
    last_access?: boolean;
  };
  actions: string[];
}

const locales = [
  { id: 'en', name: 'English', shortName: 'EN' },
  { id: 'de', name: 'Deutsch', shortName: 'DE' },
];

@Injectable({
  providedIn: 'root'
})
export class SystemService {

  private _systemInfo$: Observable<SystemInfo>;

  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
  ) {
    this.initService();
  }

  /**
   * maps the policy action list from the backend response to the corresponding
   * frontend permissions.
   *
   * @private
   * @static
   * @template T backend response type from linotp context or pre_context api calls
   * @param {T} systemInfo backend response
   * @returns
   * @memberof SystemService
   */
  private static mapPoliciesToPermissions<T extends { actions: string[] }>(systemInfo: T): T & { permissions: Permission[] } {
    return {
      ...systemInfo,
      permissions: systemInfo.actions
        .filter(a => PoliciesToPermissionsMapping.hasOwnProperty(a))
        .map(a => PoliciesToPermissionsMapping[a])
    };
  }

  initService() {
    // initialize systemInfo$ observable and load the latest
    // system info from the backend on the first consumer subscription
    this._systemInfo$ = this.loadSystemInfo().pipe(
      tap(systemInfo => {
        if (systemInfo) {
          localStorage.setItem('systemInfo', JSON.stringify(systemInfo));
        }
      }),
      startWith(JSON.parse(localStorage.getItem('systemInfo'))),
      filter(systemInfo => !!systemInfo),
      shareReplay(1),
    );
  }

  /**
   * loads system information without a user context.
   *
   * The backend provides dynamic details about the system. This API works
   * without a valid session and does not provide user specific information.
   * Use the getUserSystemInfo() method to recieve all available infos with a
   * session.
   *
   * This method is usefull to recieve information about the login process.
   *
   * @returns {Observable<SystemInfo>}
   * @memberof SystemService
   */
  private loadSystemInfo(): Observable<SystemInfo> {

    return this.http.get<LinOTPResponse<boolean, SystemInfo>>('/userservice/pre_context').pipe(
      map(response => response.detail),
    );
  }

  /**
   * an observable to the SystemInfo. It is returning a stored backup if available
   * and loads the latest version from the backend once for all consumers
   *
   * @returns {Observable<SystemInfo>}
   * @memberof SystemService
   */
  public getSystemInfo$(): Observable<SystemInfo> {
    return this._systemInfo$;
  }

  /**
   * get system information with a user context.
   *
   * The backend provides dynamic details about the system and logged in user.
   *
   * @returns {Observable<SystemInfo>}
   * @memberof SystemService
   */
  getUserSystemInfo(): Observable<UserSystemInfo> {
    type contextResponse = Omit<UserSystemInfo, 'permissions'> & { actions: string[] };

    const options = {
      params: { session: this.sessionService.getSession() }
    };

    return this.http.get<LinOTPResponse<boolean, contextResponse>>('/userservice/context', options).pipe(
      map(response => response.detail),
      map(SystemService.mapPoliciesToPermissions),
    );
  }

  /**
   * get supported system locales
   *
   * This is only the list of frontend translations available, backend support is not assessed here.
   *
   * @returns list of locales
   * @memberof SystemService
   */
  getLocales(): { id: string, name: string, shortName: string }[] {
    return locales;
  }
}
