import { Pipe, PipeTransform } from '@angular/core';
import { Token, EnrollmentStatus } from './token';

@Pipe({
  name: 'sortTokensByState'
})
export class SortTokensByStatePipe implements PipeTransform {

  private tokenOrder: { [status: string]: number } = {
    [EnrollmentStatus.unpaired]: 0,
    [EnrollmentStatus.pairing_challenge_sent]: 1,
    [EnrollmentStatus.pairing_response_received]: 2,
    [EnrollmentStatus.completed]: 3,
  };

  transform(value: Token[], args?: any): any {
    return value.sort((a, b) => this.tokenOrder[a.enrollmentStatus.toString()] - this.tokenOrder[b.enrollmentStatus.toString()]);
  }

}
