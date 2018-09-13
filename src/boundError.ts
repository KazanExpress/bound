export default class BoundError extends Error {
  constructor(message?: string) {
    super(message ? `[bound]: ${message}` : message);
  }
}
