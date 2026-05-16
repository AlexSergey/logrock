import '@testing-library/jest-dom';

if (typeof PromiseRejectionEvent === 'undefined') {
  (global as typeof globalThis & { PromiseRejectionEvent: unknown }).PromiseRejectionEvent =
    class PromiseRejectionEvent extends Event {
      promise: Promise<unknown>;
      reason: unknown;
      constructor(type: string, init: { promise: Promise<unknown>; reason?: unknown }) {
        super(type, { bubbles: false, cancelable: true });
        this.promise = init.promise;
        this.reason = init.reason;
      }
    };
}
