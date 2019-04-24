import { Pipe, PipeTransform } from '@angular/core';
import { Token, EnrollmentStatus } from './token';

@Pipe({
  name: 'nonActiveTokens',
  pure: true,
})
export class NonActiveTokensPipe implements PipeTransform {

  transform(value: Token[]): any {
    return value.filter(t => t.enrollmentStatus !== EnrollmentStatus.completed);
  }

}
