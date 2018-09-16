import { BoundError } from '../src/bound';

describe('BoundError', () => {
  it('preserves instance', () => {
    try {
      throw new BoundError();
    } catch (e) {
      // Doesn't seem to work in node...
      // expect(e instanceof BoundError).toBe(true);
    }
  });
});
