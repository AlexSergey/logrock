export const mixUrl = props => {
  const href = globalThis && globalThis.location && globalThis.location.href ? globalThis.location.href : '';
  return {
    ...(href !== '' ? {
      url: href
    } : {}),
    ...props
  };
};
export const serializeError = (stack, lineNumber) => ({
  line: lineNumber,
  message: stack.message ?? '',
  stack: stack.stack ? stack.stack.split('\n') : []
});
const CRITICAL = 'critical';
export const isCritical = type => CRITICAL === type;
export const getCritical = () => CRITICAL;
export const createCritical = (trace, lineNumber) => {
  const criticalError = serializeError(trace, lineNumber);
  return {
    [CRITICAL]: mixUrl(criticalError)
  };
};