import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arrayNotEmpty',
  pure: true,
})
export class ArrayNotEmptyPipe implements PipeTransform {

  /**
   * decides whether a given value is a non-empty array or not
   *
   * @param {any[]} value array to examine
   * @returns {boolean}
   * @memberof ArrayNotEmptyPipe
   */
  transform(value: any[]): boolean {
    return value?.length > 0;
  }

}
