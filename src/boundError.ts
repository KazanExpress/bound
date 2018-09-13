export default class BoundError extends Error {
  constructor(message: string) {
    super(`[bound]: ${message}`);
  }
}
