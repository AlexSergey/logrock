import LimitedArray from "limited-array";

import { createCritical } from "./error-helpers";
import { LogEntry, Stack, StackUtilProps } from "./types";
import { clone, getCurrentDate } from "./utils";

const getStackData = (stack: Stack, stackCollection: LimitedArray<LogEntry>, props: StackUtilProps): Stack => {
  const lang = globalThis.navigator?.languages?.[0] ?? "";
  const href = globalThis.location && globalThis.location.href ? globalThis.location.href : "";
  const actions = stackCollection.getData();

  stack.session.end = typeof props.getCurrentDate === "function" ? props.getCurrentDate() : getCurrentDate();
  stack.actions = actions;
  stack.env.lang = lang;
  stack.env.href = href;

  if (typeof props.onPrepareStack === "function") {
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
