import { LogEntry, LoggerLevels, Stack } from '../types';
import LimitedArray from './limited-array';
import { getStackData, onCriticalError } from './stack';

const makeStack = (overrides: Partial<Stack> = {}): Stack => ({
  actions: [],
  env: {},
  keyboardPressed: null,
  mousePressed: null,
  session: { end: '', start: '2024-01-01' },
  sessionId: undefined,
  ...overrides,
});

describe('getStackData', () => {
  describe('negative cases', () => {
    it('does not throw when no props are provided', () => {
      expect(() => getStackData(makeStack(), new LimitedArray<LogEntry>(), {})).not.toThrow();
    });

    it('does not call onPrepareStack when it is not provided', () => {
      const spy = jest.fn();
      getStackData(makeStack(), new LimitedArray<LogEntry>(), {});
      expect(spy).not.toHaveBeenCalled();
    });

    it('sets env.lang to empty string when navigator is unavailable', () => {
      const original = globalThis.navigator;
      Object.defineProperty(globalThis, 'navigator', { configurable: true, value: null });
      const result = getStackData(makeStack(), new LimitedArray<LogEntry>(), {});
      Object.defineProperty(globalThis, 'navigator', { configurable: true, value: original });
      expect(result.env.lang).toBe('');
    });
  });

  describe('positive cases', () => {
    it('populates env.href from location.href', () => {
      const result = getStackData(makeStack(), new LimitedArray<LogEntry>(), {});
      expect(result.env.href).toBe(globalThis.location.href);
    });

    it('sets session.end from the getCurrentDate prop', () => {
      const result = getStackData(makeStack(), new LimitedArray<LogEntry>(), {
        getCurrentDate: () => '2024-12-31',
      });
      expect(result.session.end).toBe('2024-12-31');
    });

    it('falls back to built-in getCurrentDate when prop is absent', () => {
      const result = getStackData(makeStack(), new LimitedArray<LogEntry>(), {});
      expect(typeof result.session.end).toBe('string');
      expect(result.session.end.length).toBeGreaterThan(0);
    });

    it('populates actions from the collection', () => {
      const collection = new LimitedArray<LogEntry>();
      collection.add({ ctx: '', level: 'log', message: 'action-a' } as LogEntry);
      collection.add({ ctx: '', level: 'info', message: 'action-b' } as LogEntry);
      const result = getStackData(makeStack(), collection, {});
      expect(result.actions).toContainEqual({ ctx: '', level: 'log', message: 'action-a' });
      expect(result.actions).toContainEqual({ ctx: '', level: 'info', message: 'action-b' });
    });

    it('reflects the latest state of the collection on each call', () => {
      const stack = makeStack();
      const collection = new LimitedArray<LogEntry>();
      collection.add({ ctx: '', level: 'log', message: 'first' } as LogEntry);
      expect(getStackData(stack, collection, {}).actions.length).toBe(1);
      collection.add({ ctx: '', level: 'log', message: 'second' } as LogEntry);
      expect(getStackData(stack, collection, {}).actions.length).toBe(2);
    });

    it('calls onPrepareStack with the mutated stack', () => {
      const onPrepareStack = jest.fn((s: Stack) => s);
      getStackData(makeStack(), new LimitedArray<LogEntry>(), { onPrepareStack });
      expect(onPrepareStack).toHaveBeenCalledTimes(1);
      expect(onPrepareStack).toHaveBeenCalledWith(expect.objectContaining({ actions: [] }));
    });

    it('returns a clone — different reference from the original', () => {
      const stack = makeStack();
      const result = getStackData(stack, new LimitedArray<LogEntry>(), {});
      expect(result).not.toBe(stack);
      expect(result.session).not.toBe(stack.session);
    });

    it('preserves sessionId in the returned clone', () => {
      const result = getStackData(makeStack({ sessionId: 'my-id' }), new LimitedArray<LogEntry>(), {});
      expect(result.sessionId).toBe('my-id');
    });
  });
});

describe('onCriticalError', () => {
  describe('positive cases', () => {
    it('adds a critical entry to the collection', () => {
      const collection = new LimitedArray<LogEntry>();
      onCriticalError(makeStack(), collection, {}, new Error('boom'), 42);
      expect(collection.getData().some((i) => i.level === LoggerLevels.critical)).toBe(true);
    });

    it('critical entry has the correct line number', () => {
      const collection = new LimitedArray<LogEntry>();
      onCriticalError(makeStack(), collection, {}, new Error('crash'), 100);
      const item = collection.getData().find((i) => i.level === LoggerLevels.critical)!;
      expect((item.message as { line: number }).line).toBe(100);
    });

    it('critical entry has the correct error message', () => {
      const collection = new LimitedArray<LogEntry>();
      onCriticalError(makeStack(), collection, {}, new Error('specific error'), 1);
      const item = collection.getData().find((i) => i.level === LoggerLevels.critical)!;
      expect((item.message as { message: string }).message).toBe('specific error');
    });

    it('returns a Stack that includes the critical action', () => {
      const result = onCriticalError(makeStack(), new LimitedArray<LogEntry>(), {}, new Error('test crash'), 1);
      expect(result.actions.some((i) => i.level === LoggerLevels.critical)).toBe(true);
    });

    it('passes props through to getStackData — calls onPrepareStack', () => {
      const onPrepareStack = jest.fn((s: Stack) => s);
      onCriticalError(makeStack(), new LimitedArray<LogEntry>(), { onPrepareStack }, new Error('err'), 1);
      expect(onPrepareStack).toHaveBeenCalledTimes(1);
    });

    it('uses custom getCurrentDate for session.end in the returned stack', () => {
      const result = onCriticalError(
        makeStack(),
        new LimitedArray<LogEntry>(),
        { getCurrentDate: () => 'custom-date' },
        new Error('err'),
        1,
      );
      expect(result.session.end).toBe('custom-date');
    });
  });
});
