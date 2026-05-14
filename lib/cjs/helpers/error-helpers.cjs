"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.serializeError = exports.mixUrl = exports.isCritical = exports.getCritical = exports.createCritical = void 0;
const mixUrl = props => {
  const href = globalThis && globalThis.location && globalThis.location.href ? globalThis.location.href : '';
  return {
    ...(href !== '' ? {
      url: href
    } : {}),
    ...props
  };
};
exports.mixUrl = mixUrl;
const serializeError = (stack, lineNumber) => ({
  line: lineNumber,
  message: stack.message ?? '',
  stack: stack.stack ? stack.stack.split('\n') : []
});
exports.serializeError = serializeError;
const CRITICAL = 'critical';
const isCritical = type => CRITICAL === type;
exports.isCritical = isCritical;
const getCritical = () => CRITICAL;
exports.getCritical = getCritical;
const createCritical = (trace, lineNumber) => {
  const criticalError = serializeError(trace, lineNumber);
  return {
    [CRITICAL]: mixUrl(criticalError)
  };
};
exports.createCritical = createCritical;