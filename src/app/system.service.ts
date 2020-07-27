import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, forkJoin } from 'rxjs';
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
  autoassign: boolean;
  licenseinfo: string;
  realms: {
    [realmName: string]: {
      default: boolean,
      realmname: string,
      useridresolver: string[],
      entry: string,
    }
  };
  default_realm: string;
  mfa_login: boolean;
  version: string;
  realm_box: boolean;
  mfa_3_fields: boolean;
  autoenroll: boolean;
}

export interface UserInfo {
  username: string;
  userid: string;
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
  realm: string;
}

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
   * parses the realms list from the backend response to conform to the
   * SystemInfo/UserSystemInfo interface.
   *
   * @private
   * @static
   * @template T backend response type from linotp context or pre_context api calls
   * @param {T} systemInfo backend response
   * @returns
   * @memberof SystemService
   */
  private static parseRealmsList<T extends { realms: string }>(systemInfo: T): T & Pick<SystemInfo, 'realms'> {
    return { ...systemInfo, realms: JSON.parse(systemInfo.realms) };
  }

  /**
   * gets system information without a user context.
   *
   * The backend provides dynamic details about the system. This API works
   * without a valid session and does not provide user specific information.
   * Use the getSystemInfo() method to recieve all available infos with a
   * session.
   *
   * This method is usefull to recieve information about the login process.
   *
   * @returns {Observable<SystemInfo>}
   * @memberof SystemService
   */
  getSystemInfo(): Observable<SystemInfo> {
    /*
     * the api does not provide the full SystemInfo interface. We need to parse
     * some parts manually. The typing process is fully covered by replacing the
     * relevant object types in the apiResponse type.
     */
    type apiResponse = Omit<SystemInfo, 'realms'> & { realms: string };

    return this.http.get<apiResponse>('/userservice/pre_context').pipe(
      // parse realms that are returned as stringified json
      map(SystemService.parseRealmsList),
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
    /*
     * the api does not provide the full UserSystemInfo interface. We need to parse
     * some parts manually and get user info with a separate request.
     * The typing process is fully covered by replacing the
     * relevant object types in the type sets.
     */
    type contextResponse = Omit<UserSystemInfo, 'realms' | 'permissions' | 'user'> & { realms: string, actions: string[] };

    const options = {
      params: { session: this.sessionService.getSession() }
    };

    return forkJoin([
      this.http.get<contextResponse>('/userservice/context', options).pipe(
        map(SystemService.parseRealmsList),
        map(SystemService.mapPoliciesToPermissions),
      ),
      this.http.get<LinOTPResponse<UserInfo>>('/userservice/userinfo', options),
    ]).pipe(
      map(([context, userResponse]) => {
        return { ...context, user: userResponse.result.value };
      })
    );
  }
}
