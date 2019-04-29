import { ArrayNotEmptyPipe } from './array-not-empty.pipe';

describe('ArrayNotEmptyPipe', () => {
  it('creates an instance', () => {
    const pipe = new ArrayNotEmptyPipe();
    expect(pipe).toBeTruthy();
  });

  it('decides whether an array is empty or not', () => {
    const pipe = new ArrayNotEmptyPipe();

    expect(pipe.transform([])).toBe(false);

    expect(pipe.transform([1])).toBe(true);
    expect(pipe.transform([1, 'abc'])).toBe(true);
  });

  it('handles undefined as input', () => {
    const pipe = new ArrayNotEmptyPipe();

    expect(pipe.transform(undefined)).toBe(false);
  });

  it('handles null as input', () => {
    const pipe = new ArrayNotEmptyPipe();

    expect(pipe.transform(null)).toBe(false);
  });

});
