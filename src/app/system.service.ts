import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Permission, PoliciesToPermissionsMapping } from './common/permissions';
import { SessionService } from './auth/session.service';
import { LinOTPResponse } from './api/api';

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
      default: boolean,
      realmname: string,
      useridresolver: string[],
      entry: string,
    }
  };
  settings: {
    autoassign: boolean;
    default_realm: string;
    mfa_login: boolean;
    realm_box: boolean;
    mfa_3_fields: boolean;
    autoenroll: boolean;
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
  imprint: string;
  user: UserInfo;
  settings: SystemInfo['settings'] & {
    edit_sms?: number,
    edit_email?: number,
  };
}

const locales = [
  { id: 'en', name: 'English', shortName: 'EN' },
  { id: 'de', name: 'Deutsch', shortName: 'DE' },
];

@Injectable({
  providedIn: 'root'
})
export class SystemService {

  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
  ) { }

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

  /**
   * gets system information without a user context.
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
  getSystemInfo(): Observable<SystemInfo> {
    return this.http.get<LinOTPResponse<boolean, SystemInfo>>('/userservice/pre_context').pipe(
      map(response => response.detail),
    );
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
