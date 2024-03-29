import { LoggerLevels, CriticalError } from './types';

export const mixUrl = (props: CriticalError): CriticalError => {
  const href = globalThis && globalThis.location && globalThis.location.href ? globalThis.location.href : '';

  return { ...(href !== '' ? { url: href } : {}), ...props };
};

export const serializeError = (stack: Error, lineNumber: number): CriticalError => {
  const alt = {
    line: lineNumber,
    message: '',
    stack: [],
  };

  Object.getOwnPropertyNames(stack).forEach((key) => {
    if (key === 'stack') {
      alt[key] = stack[key].split('\n');
    } else {
      alt[key] = stack[key];
    }
  }, stack);

  return alt;
};

const CRITICAL = 'critical';

export const isCritical = (type: string): boolean => CRITICAL === type;

export const getCritical = (): string => CRITICAL;

export const createCritical = (trace: Error, lineNumber: number): { [LoggerLevels.critical]: CriticalError } => {
  const criticalError: CriticalError = serializeError(trace, lineNumber);

  return {
    [CRITICAL]: mixUrl(criticalError),
  };
};
