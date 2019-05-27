import { Pipe, PipeTransform } from '@angular/core';
import { Token, EnrollmentStatus } from '../../api/token';

@Pipe({
  name: 'sortTokensByState'
})
export class SortTokensByStatePipe implements PipeTransform {

  private tokenOrder: { [status: string]: number } = {
    [EnrollmentStatus.UNPAIRED]: 0,
    [EnrollmentStatus.PAIRING_CHALLENGE_SENT]: 1,
    [EnrollmentStatus.PAIRING_RESPONSE_RECEIVED]: 2,
    [EnrollmentStatus.COMPLETED]: 3,
  };

  transform(value: Token[], args?: any): any {
    return value.sort((a, b) => this.tokenOrder[a.enrollmentStatus.toString()] - this.tokenOrder[b.enrollmentStatus.toString()]);
  }

}
