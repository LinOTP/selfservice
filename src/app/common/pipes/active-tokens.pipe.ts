import { Pipe, PipeTransform } from '@angular/core';
import { Token, EnrollmentStatus } from '../../api/token';

@Pipe({
  name: 'activeTokens',
  pure: true,
})
export class ActiveTokensPipe implements PipeTransform {

  transform(value: Token[]): any {
    return value.filter(t => t.enrollmentStatus === EnrollmentStatus.COMPLETED && t.enabled);
  }

}
