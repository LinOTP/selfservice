import { Pipe, PipeTransform } from '@angular/core';
import { Token, EnrollmentStatus } from './token';

@Pipe({
  name: 'nonActiveTokens'
})
export class NonActiveTokensPipe implements PipeTransform {

  transform(value: Token[], args?: any): any {
    return value.filter(t => t.enrollmentStatus !== EnrollmentStatus.completed);
  }

}
