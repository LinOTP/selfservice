import { NonActiveTokensPipe } from './non-active-tokens.pipe';

describe('TokenActivationRequiredPipe', () => {
  it('create an instance', () => {
    const pipe = new NonActiveTokensPipe();
    expect(pipe).toBeTruthy();
  });
});
