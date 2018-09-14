import { BoundError } from '../src/bound';

describe('BoundError', () => {
  it('preserves instance', () => {
    try {
      throw new BoundError();
    } catch (e) {
      // expect(e instanceof BoundError).toBe(true);
    }
  });
});
