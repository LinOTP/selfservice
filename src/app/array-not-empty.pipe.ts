import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arrayNotEmpty'
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
    return !!value && value.length > 0;
  }

}
