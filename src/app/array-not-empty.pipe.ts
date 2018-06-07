import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arrayNotEmpty'
})
export class ArrayNotEmptyPipe implements PipeTransform {

  transform(value: any[], args?: any): any {
    return value.length > 0;
  }

}
