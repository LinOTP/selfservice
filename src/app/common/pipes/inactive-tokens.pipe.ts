import { Pipe, PipeTransform } from '@angular/core';
import { Token, EnrollmentStatus } from '../../api/token';

@Pipe({
  name: 'inactiveTokens',
  pure: true,
})
export class InactiveTokensPipe implements PipeTransform {

  transform(value: Token[]): any {
    return value.filter(t => t.enrollmentStatus === EnrollmentStatus.COMPLETED && !t.enabled);
  }

}
