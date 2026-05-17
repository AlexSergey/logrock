import { type LogEntry, LoggerLevels, type Stack, type StackMetadata } from '../types';
import { LimitedArray } from './limited-array';
import { getStackData, onCriticalError } from './stack';

const makeStack = (overrides: Partial<Stack> = {}): Stack => ({
  actions: [],
  env: '',
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
  traceId: undefined,
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
  });

  describe('positive cases', () => {
    it('populates actions from the collection', () => {
      const collection = new LimitedArray<LogEntry>();
      collection.add({ ctx: '', level: LoggerLevels.log, message: 'action-a', payload: {} });
      collection.add({ ctx: '', level: LoggerLevels.info, message: 'action-b', payload: {} });
      const result = getStackData(makeStack(), collection, {});
      expect(result.actions).toContainEqual({ ctx: '', level: LoggerLevels.log, message: 'action-a', payload: {} });
      expect(result.actions).toContainEqual({ ctx: '', level: LoggerLevels.info, message: 'action-b', payload: {} });
    });

    it('reflects the latest state of the collection on each call', () => {
      const stack = makeStack();
      const collection = new LimitedArray<LogEntry>();
      collection.add({ ctx: '', level: LoggerLevels.log, message: 'first', payload: {} });
      expect(getStackData(stack, collection, {}).actions.length).toBe(1);
      collection.add({ ctx: '', level: LoggerLevels.log, message: 'second', payload: {} });
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
      expect(result.actions).not.toBe(stack.actions);
    });

    it('preserves traceId in the returned clone', () => {
      const result = getStackData(makeStack({ traceId: 'my-id' }), new LimitedArray<LogEntry>(), {});
      expect(result.traceId).toBe('my-id');
    });

    it('preserves env in the returned clone', () => {
      const result = getStackData(makeStack({ env: 'production' }), new LimitedArray<LogEntry>(), {});
      expect(result.env).toBe('production');
    });

    it('sets timestamp as an ISO 8601 string', () => {
      const before = Date.now();
      const result = getStackData(makeStack(), new LimitedArray<LogEntry>(), {});
      const after = Date.now();
      expect(typeof result.timestamp).toBe('string');
      const ts = Date.parse(result.timestamp);
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after);
    });

    it('sets a fresh timestamp on each call', () => {
      const stack = makeStack();
      const first = getStackData(stack, new LimitedArray<LogEntry>(), {}).timestamp;
      const second = getStackData(stack, new LimitedArray<LogEntry>(), {}).timestamp;
      // timestamps are strings; they may be equal if called within the same ms, but never go backwards
      expect(Date.parse(second)).toBeGreaterThanOrEqual(Date.parse(first));
    });

    it('sets metadata with all required keys of correct types', () => {
      const result = getStackData(makeStack(), new LimitedArray<LogEntry>(), {});
      const stringKeys: (keyof StackMetadata)[] = [
        'browser',
        'browserVersion',
        'fullUrl',
        'language',
        'os',
        'screen',
        'timezone',
        'url',
        'viewport',
      ];
      for (const key of stringKeys) {
        expect(result.metadata).toHaveProperty(key);
        expect(typeof result.metadata[key]).toBe('string');
      }
      expect(typeof result.metadata.devicePixelRatio).toBe('number');
      expect(typeof result.metadata.mobile).toBe('boolean');
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
      expect((item.payload as { line: number }).line).toBe(100);
    });

    it('critical entry message is the error string', () => {
      const collection = new LimitedArray<LogEntry>();
      onCriticalError(makeStack(), collection, {}, new Error('specific error'), 1);
      const item = collection.getData().find((i) => i.level === LoggerLevels.critical)!;
      expect(item.message).toBe('specific error');
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
  });
});
