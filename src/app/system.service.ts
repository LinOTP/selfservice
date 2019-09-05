import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Permission, PoliciesToPermissionsMapping } from './common/permissions';

/**
 * Interface that provides available information about the system and the user.
 *
 * @export
 * @interface UserSystemInfo
 */
export interface UserSystemInfo {
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
  autoenroll: boolean; permissions: Permission[];
  imprint: string;
  user: string;
  realm: string;
}

@Injectable({
  providedIn: 'root'
})
export class SystemService {

  constructor(private http: HttpClient) { }

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
  private static parseRealmsList<T extends { realms: string }>(systemInfo: T): T & Pick<UserSystemInfo, 'realms'> {
    return { ...systemInfo, realms: JSON.parse(systemInfo.realms) };
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
     * some parts manually. The typing process is fully covered by replacing the
     * relevant object types in the apiResponse type.
     */
    type apiResponse = Omit<UserSystemInfo, 'realms' | 'permissions'> & { realms: string, actions: string[] };

    return this.http.get<apiResponse>('/userservice/context').pipe(
      map(SystemService.parseRealmsList),
      map(SystemService.mapPoliciesToPermissions),
    );
  }
}
