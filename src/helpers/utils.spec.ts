import type { LogEntry, Stack } from '../types';

import { clone } from './utils';

const makeStack = (): Stack => ({
  actions: [],
  env: 'http://example.com',
  metadata: {
    browser: '',
    browserVersion: '',
    devicePixelRatio: 1,
    fullUrl: '',
    language: '',
    mobile: false,
    os: '',
    screen: '',
    timezone: '',
    url: '',
    viewport: '',
  },
  timestamp: '',
  traceId: 'test-trace',
});

describe('clone', () => {
  describe('negative cases', () => {
    it('returns a different reference from the original', () => {
      const stack = makeStack();
      expect(clone(stack)).not.toBe(stack);
    });

    it('actions array is a separate reference', () => {
      const stack = makeStack();
      const cloned = clone(stack);
      expect(cloned.actions).not.toBe(stack.actions);
    });

    it('mutations to clone do not affect the original', () => {
      const stack = makeStack();
      const cloned = clone(stack);
      cloned.env = 'mutated';
      expect(stack.env).toBe('http://example.com');
    });
  });

  describe('positive cases', () => {
    it('deep clones primitive fields', () => {
      const stack = makeStack();
      const cloned = clone(stack);
      expect(cloned.traceId).toBe(stack.traceId);
      expect(cloned.env).toBe(stack.env);
    });

    it('deep clones actions including nested objects', () => {
      const stack: Stack = { ...makeStack(), actions: [{ log: 'test' } as unknown as LogEntry] };
      const cloned = clone(stack);
      expect(cloned.actions).toEqual(stack.actions);
      expect(cloned.actions[0]).not.toBe(stack.actions[0]);
    });
  });
});
