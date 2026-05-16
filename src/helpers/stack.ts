import type { LogEntry, Stack, StackUtilProps } from '../types';
import type { LimitedArray } from './limited-array';

import { createCritical } from './error-helpers';
import { clone } from './utils';

const getStackData = (stack: Stack, stackCollection: LimitedArray<LogEntry>, props: StackUtilProps): Stack => {
  stack.actions = stackCollection.getData();

  if (typeof props.onPrepareStack === 'function') {
    props.onPrepareStack(stack);
  }

  return clone(stack);
};

const onCriticalError = (
  stack: Stack,
  stackCollection: LimitedArray<LogEntry>,
  props: StackUtilProps,
  trace: Error,
  lineNumber: number,
): Stack => {
  stackCollection.add(createCritical(trace, lineNumber));

  return getStackData(stack, stackCollection, props);
};

export { getStackData, onCriticalError };
