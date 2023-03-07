import LimitedArray from 'limited-array';
import { isArray, isFunction } from 'valid-types';

import { createCritical } from './error-helpers';
import { IStack, IPropsUtils, IAction } from './types';
import { getCurrentDate, clone } from './utils';

const getStackData = (stack: IStack, stackCollection: LimitedArray<IAction>, props: IPropsUtils): IStack => {
  const lang =
    globalThis.navigator && globalThis.navigator.languages && isArray(globalThis.navigator.languages)
      ? globalThis.navigator.languages[0]
      : '';
  const href = globalThis.location && globalThis.location.href ? globalThis.location.href : '';
  const actions = stackCollection.getData();

  stack.session.end = isFunction(props.getCurrentDate) ? props.getCurrentDate() : getCurrentDate();
  stack.actions = actions;
  stack.env.lang = lang;
  stack.env.href = href;

  if (typeof props.onPrepareStack !== 'undefined' && isFunction(props.onPrepareStack)) {
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
