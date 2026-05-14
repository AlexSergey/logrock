import LimitedArray from 'limited-array';

import { getStackData, onCriticalError } from './stack';
import { IAction, IStack } from './types';

const makeStack = (overrides: Partial<IStack> = {}): IStack => ({
  actions: [],
  env: {},
  keyboardPressed: null,
  mousePressed: null,
  session: { start: '2024-01-01', end: '' },
  sessionId: undefined,
  ...overrides,
});

describe('getStackData', () => {
  describe('negative cases', () => {
    it('does not throw when no props are provided', () => {
      expect(() => getStackData(makeStack(), new LimitedArray<IAction>(), {})).not.toThrow();
    });

    it('does not call onPrepareStack when it is not provided', () => {
      const spy = jest.fn();
      getStackData(makeStack(), new LimitedArray<IAction>(), {});
      expect(spy).not.toHaveBeenCalled();
    });

    it('sets env.lang to empty string when navigator is unavailable', () => {
      const original = globalThis.navigator;
      Object.defineProperty(globalThis, 'navigator', { value: null, configurable: true });
      const result = getStackData(makeStack(), new LimitedArray<IAction>(), {});
      Object.defineProperty(globalThis, 'navigator', { value: original, configurable: true });
      expect(result.env.lang).toBe('');
    });
  });

  describe('positive cases', () => {
    it('populates env.href from location.href', () => {
      const result = getStackData(makeStack(), new LimitedArray<IAction>(), {});
      expect(result.env.href).toBe(globalThis.location.href);
    });

    it('sets session.end from the getCurrentDate prop', () => {
      const result = getStackData(makeStack(), new LimitedArray<IAction>(), {
        getCurrentDate: () => '2024-12-31',
      });
      expect(result.session.end).toBe('2024-12-31');
    });

    it('falls back to built-in getCurrentDate when prop is absent', () => {
      const result = getStackData(makeStack(), new LimitedArray<IAction>(), {});
      expect(typeof result.session.end).toBe('string');
      expect(result.session.end.length).toBeGreaterThan(0);
    });

    it('populates actions from the collection', () => {
      const collection = new LimitedArray<IAction>();
      collection.add({ log: 'action-a' } as unknown as IAction);
      collection.add({ info: 'action-b' } as unknown as IAction);
      const result = getStackData(makeStack(), collection, {});
      expect(result.actions).toContainEqual({ log: 'action-a' });
      expect(result.actions).toContainEqual({ info: 'action-b' });
    });

    it('reflects the latest state of the collection on each call', () => {
      const stack = makeStack();
      const collection = new LimitedArray<IAction>();
      collection.add({ log: 'first' } as unknown as IAction);
      expect(getStackData(stack, collection, {}).actions.length).toBe(1);
      collection.add({ log: 'second' } as unknown as IAction);
      expect(getStackData(stack, collection, {}).actions.length).toBe(2);
    });

    it('calls onPrepareStack with the mutated stack', () => {
      const onPrepareStack = jest.fn((s: IStack) => s);
      getStackData(makeStack(), new LimitedArray<IAction>(), { onPrepareStack });
      expect(onPrepareStack).toHaveBeenCalledTimes(1);
      expect(onPrepareStack).toHaveBeenCalledWith(expect.objectContaining({ actions: [] }));
    });

    it('returns a clone — different reference from the original', () => {
      const stack = makeStack();
      const result = getStackData(stack, new LimitedArray<IAction>(), {});
      expect(result).not.toBe(stack);
      expect(result.session).not.toBe(stack.session);
    });

    it('preserves sessionId in the returned clone', () => {
      const result = getStackData(makeStack({ sessionId: 'my-id' }), new LimitedArray<IAction>(), {});
      expect(result.sessionId).toBe('my-id');
    });
  });
});

describe('onCriticalError', () => {
  describe('positive cases', () => {
    it('adds a critical entry to the collection', () => {
      const collection = new LimitedArray<IAction>();
      onCriticalError(makeStack(), collection, {}, new Error('boom'), 42);
      expect(collection.getData().some((i) => 'critical' in i)).toBe(true);
    });

    it('critical entry has the correct line number', () => {
      const collection = new LimitedArray<IAction>();
      onCriticalError(makeStack(), collection, {}, new Error('crash'), 100);
      const item = collection.getData().find((i) => 'critical' in i) as { critical: { line: number } };
      expect(item.critical.line).toBe(100);
    });

    it('critical entry has the correct error message', () => {
      const collection = new LimitedArray<IAction>();
      onCriticalError(makeStack(), collection, {}, new Error('specific error'), 1);
      const item = collection.getData().find((i) => 'critical' in i) as { critical: { message: string } };
      expect(item.critical.message).toBe('specific error');
    });

    it('returns an IStack that includes the critical action', () => {
      const result = onCriticalError(makeStack(), new LimitedArray<IAction>(), {}, new Error('test crash'), 1);
      expect(result.actions.some((i) => 'critical' in i)).toBe(true);
    });

    it('passes props through to getStackData — calls onPrepareStack', () => {
      const onPrepareStack = jest.fn((s: IStack) => s);
      onCriticalError(makeStack(), new LimitedArray<IAction>(), { onPrepareStack }, new Error('err'), 1);
      expect(onPrepareStack).toHaveBeenCalledTimes(1);
    });

    it('uses custom getCurrentDate for session.end in the returned stack', () => {
      const result = onCriticalError(
        makeStack(),
        new LimitedArray<IAction>(),
        { getCurrentDate: () => 'custom-date' },
        new Error('err'),
        1,
      );
      expect(result.session.end).toBe('custom-date');
    });
  });
});
