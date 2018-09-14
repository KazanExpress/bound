export default class BoundError extends Error {
  constructor(message?: string) {
    /* istanbul ignore next */
    super(message ? `[bound]: ${message}` : message);
  }
}
