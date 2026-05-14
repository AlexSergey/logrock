import LimitedArray from 'limited-array';

import { createCritical } from './error-helpers';
import { IStack, IPropsUtils, IAction } from './types';
import { getCurrentDate, clone } from './utils';

const getStackData = (stack: IStack, stackCollection: LimitedArray<IAction>, props: IPropsUtils): IStack => {
  const lang = globalThis.navigator?.languages?.[0] ?? '';
  const href = globalThis.location && globalThis.location.href ? globalThis.location.href : '';
  const actions = stackCollection.getData();

  stack.session.end = typeof props.getCurrentDate === 'function' ? props.getCurrentDate() : getCurrentDate();
  stack.actions = actions;
  stack.env.lang = lang;
  stack.env.href = href;

  if (typeof props.onPrepareStack === 'function') {
    props.onPrepareStack(stack);
  }

  return clone(stack);
};

// eslint-disable-next-line max-len
const onCriticalError = (
  stack: IStack,
  stackCollection: LimitedArray<IAction>,
  props: IPropsUtils,
  trace: Error,
  lineNumber: number,
): IStack => {
  stackCollection.add(createCritical(trace, lineNumber));

  return getStackData(stack, stackCollection, props);
};

export { getStackData, onCriticalError };
