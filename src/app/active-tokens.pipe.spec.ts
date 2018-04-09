import { ActiveTokensPipe } from './active-tokens.pipe';

describe('TokenActivationFinishedPipe', () => {
  it('create an instance', () => {
    const pipe = new ActiveTokensPipe();
    expect(pipe).toBeTruthy();
  });
});
