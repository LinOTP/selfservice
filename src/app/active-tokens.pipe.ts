import { Pipe, PipeTransform } from '@angular/core';
import { Token, EnrollmentStatus } from './token';

@Pipe({
  name: 'activeTokens'
})
export class ActiveTokensPipe implements PipeTransform {

  transform(value: Token[], args?: any): any {
    return value.filter(t => t.enrollmentStatus === EnrollmentStatus.completed);
  }

}
