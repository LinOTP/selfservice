import { ArrayNotEmptyPipe } from './array-not-empty.pipe';

describe('ArrayNotEmptyPipe', () => {
  it('create an instance', () => {
    const pipe = new ArrayNotEmptyPipe();
    expect(pipe).toBeTruthy();
  });
});
