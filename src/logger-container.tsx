import {
  createContext,
  type FunctionComponent,
  type PropsWithChildren,
  type ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { LoggerInstance, Stack, Stdout } from './types';

import { type BsodProps, Bsod as DefaultBsod } from './components/bsod';
import { getStackData, onCriticalError } from './helpers/stack';
import { logger } from './logger';

interface LoggerContextValue {
  getStackData: () => Stack;
  onError: (stack: Stack) => void;
}

export const LoggerContext = createContext<LoggerContextValue | null>(null);

const isBackend = (): boolean => typeof window === 'undefined';

interface LoggerApiReturn {
  getStackData: () => Stack;
  triggerError: (stack: Stack) => void;
}

export const useLoggerApi = (): LoggerApiReturn => {
  const ctx = useContext(LoggerContext) as LoggerContextValue;

  return {
    getStackData: ctx.getStackData,
    triggerError: ctx.onError,
  };
};

interface LoggerContainerProps {
  bsodComponent?: FunctionComponent<BsodProps>;
  enabled?: boolean;
  env?: string;
  limit?: number;
  logger?: LoggerInstance;
  onError?: (stack: Stack) => void;
  onPrepareStack?: (stack: Stack) => Stack;
  showBsod?: boolean;
  stdout?: Stdout;
  traceId?: number | string;
}

export const LoggerContainer = ({
  bsodComponent,
  children,
  enabled = true,
  env = '',
  limit = 25,
  onError: onErrorCallback,
  onPrepareStack,
  showBsod = true,
  stdout,
  traceId,
}: PropsWithChildren<LoggerContainerProps>): ReactElement => {
  const [bsodVisible, setBsodVisible] = useState(false);
  const hasCriticalError = useRef(false);

  const stack = useRef<Stack>({
    actions: logger.getStackCollection().data,
    env,
    metadata: {
      browser: '',
      browserVersion: '',
      devicePixelRatio: 1,
      fullUrl: '',
      language: '',
      mobile: false,
      os: '',
      screen: '',
      timezone: '',
      url: '',
      viewport: '',
    },
    timestamp: '',
    traceId: typeof traceId === 'string' || typeof traceId === 'number' ? traceId : undefined,
  });

  useEffect(() => {
    logger.setUp({ enabled });
    logger.getStackCollection().setLimit(limit);
    if (typeof stdout === 'function') {
      logger.setUp({ stdout });
    }
  }, [enabled, limit, stdout]);

  const buildProps = useCallback(
    () => ({
      ...(typeof onPrepareStack === 'function' ? { onPrepareStack } : {}),
    }),
    [onPrepareStack],
  );

  const getStackDataFn = useCallback(
    (): Stack => getStackData(stack.current, logger.getStackCollection(), buildProps()),
    [buildProps],
  );

  const handleError = useCallback(
    (stackData: Stack): void => {
      if (typeof onErrorCallback === 'function') {
        onErrorCallback(stackData);
      }
    },
    [onErrorCallback],
  );

  const closeBsod = useCallback((): void => {
    setBsodVisible(false);
  }, []);

  useEffect(() => {
    if (!enabled || isBackend()) return;

    const triggerCritical = (error: Error, lineno: number): void => {
      if (hasCriticalError.current) return;
      hasCriticalError.current = true;
      const stackData = onCriticalError(stack.current, logger.getStackCollection(), buildProps(), error, lineno);
      handleError(stackData);
      setBsodVisible(true);
    };

    const onError = (e: ErrorEvent): void => {
      e.preventDefault();
      triggerCritical(e.error as Error, e.lineno);
    };

    const onUnhandledRejection = (e: PromiseRejectionEvent): void => {
      e.preventDefault();
      const error = e.reason instanceof Error ? e.reason : new Error(String(e.reason ?? 'Unhandled promise rejection'));
      triggerCritical(error, 0);
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return (): void => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, [enabled, buildProps, handleError]);

  const contextValue = useMemo(
    () => ({ getStackData: getStackDataFn, onError: handleError }),
    [getStackDataFn, handleError],
  );

  const BsodToRender = bsodComponent ?? DefaultBsod;

  return (
    <LoggerContext.Provider value={contextValue}>
      {children}
      {showBsod && bsodVisible && (
        <BsodToRender count={logger.getCounter()} onClose={closeBsod} stackData={getStackDataFn()} />
      )}
    </LoggerContext.Provider>
  );
};
