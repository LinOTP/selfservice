import { Pipe, PipeTransform } from '@angular/core';
import { SelfserviceToken, EnrollmentStatus } from '../../api/token';

@Pipe({
  name: 'inactiveTokens',
  pure: true,
})
export class InactiveTokensPipe implements PipeTransform {

  transform(value: SelfserviceToken[]): any {
    return value.filter(t => t.enrollmentStatus === EnrollmentStatus.COMPLETED && !t.enabled);
  }

}
