import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'capitalize',
    pure: true,
    standalone: false
})
export class CapitalizePipe implements PipeTransform {

  transform(text: String): any {
    if (!text) {
      return text;
    }
    return text.substring(0, 1).toUpperCase() + text.substring(1);
  }

}
