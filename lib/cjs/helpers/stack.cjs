"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.onCriticalError = exports.getStackData = void 0;
var _errorHelpers = require("./error-helpers.cjs");
var _utils = require("./utils.cjs");
const getStackData = (stack, stackCollection, props) => {
  const lang = globalThis.navigator?.languages?.[0] ?? '';
  const href = globalThis.location && globalThis.location.href ? globalThis.location.href : '';
  const actions = stackCollection.getData();
  stack.session.end = typeof props.getCurrentDate === 'function' ? props.getCurrentDate() : (0, _utils.getCurrentDate)();
  stack.actions = actions;
  stack.env.lang = lang;
  stack.env.href = href;
  if (typeof props.onPrepareStack === 'function') {
    props.onPrepareStack(stack);
  }
  return (0, _utils.clone)(stack);
};
exports.getStackData = getStackData;
const onCriticalError = (stack, stackCollection, props, trace, lineNumber) => {
  stackCollection.add((0, _errorHelpers.createCritical)(trace, lineNumber));
  return getStackData(stack, stackCollection, props);
};
exports.onCriticalError = onCriticalError;