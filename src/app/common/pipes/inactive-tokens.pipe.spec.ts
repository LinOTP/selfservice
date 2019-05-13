import { InactiveTokensPipe } from './inactive-tokens.pipe';

describe('InactiveTokensPipe', () => {
  it('create an instance', () => {
    const pipe = new InactiveTokensPipe();
    expect(pipe).toBeTruthy();
  });
});
