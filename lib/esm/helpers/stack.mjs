import { createCritical } from "./error-helpers.mjs";
import { clone, getCurrentDate } from "./utils.mjs";
const getStackData = (stack, stackCollection, props) => {
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
const onCriticalError = (stack, stackCollection, props, trace, lineNumber) => {
  stackCollection.add(createCritical(trace, lineNumber));
  return getStackData(stack, stackCollection, props);
};
export { getStackData, onCriticalError };