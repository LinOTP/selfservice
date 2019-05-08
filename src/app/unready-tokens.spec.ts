import { UnreadyTokensPipe } from './unready-tokens.pipe';

describe('UnreadyTokensPipe', () => {
  it('create an instance', () => {
    const pipe = new UnreadyTokensPipe();
    expect(pipe).toBeTruthy();
  });
});
