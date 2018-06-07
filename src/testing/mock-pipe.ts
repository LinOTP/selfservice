import { Pipe, PipeTransform } from '@angular/core';

export function MockPipe(options: Pipe): Pipe {

  class Mock implements PipeTransform {
    transform(value: any) { }
  }

  return Pipe(options)(Mock as any);
}
