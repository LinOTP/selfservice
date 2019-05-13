import { Pipe, PipeTransform } from '@angular/core';
import { Token, EnrollmentStatus } from './token';

@Pipe({
  name: 'unreadyTokens',
  pure: true,
})
export class UnreadyTokensPipe implements PipeTransform {

  transform(value: Token[]): any {
    return value.filter(t => t.enrollmentStatus !== EnrollmentStatus.completed);
  }

}
