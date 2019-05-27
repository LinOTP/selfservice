import { CapitalizePipe } from './capitalize.pipe';

describe('CapitalizePipe', () => {
  it('create an instance', () => {
    const pipe = new CapitalizePipe();
    expect(pipe).toBeTruthy();
  });

  it('transform should capitalize the 1st letter of the entire string', () => {
    const pipe = new CapitalizePipe();

    let input = 'abcd efgh';
    let output = 'Abcd efgh';
    expect(pipe.transform(input)).toEqual(output);

    input = 'a';
    output = 'A';
    expect(pipe.transform(input)).toEqual(output);
  });

  it('transform should return input if it is empty', () => {
    const pipe = new CapitalizePipe();
    const input = '';
    const output = '';

    expect(pipe.transform(input)).toEqual(output);
  });
});
