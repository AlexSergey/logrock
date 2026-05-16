import {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import BsodComponent, { BsodProps } from './components/bsod';
import { getStackData, onCriticalError } from './helpers/stack';
import { logger } from './logger';
import { LogEntry, LoggerInstance, Stack, Stdout } from './types';

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
  active?: boolean;
  bsod?: false | FunctionComponent<BsodProps>;
  env?: string;
  limit?: number;
  logger?: LoggerInstance;
  onError?: (stack: Stack) => void;
  onPrepareStack?: (stack: Stack) => Stack;
  stdout?: Stdout;
  traceID?: number | string;
}

interface StackRef {
  actions: LogEntry[];
  env: string;
  onPrepareStack?: (s: Stack) => Stack;
  traceId: number | string | undefined;
}

export default function LoggerContainer({
  active = true,
  bsod,
  children,
  env = '',
  limit = 25,
  onError: onErrorCallback,
  onPrepareStack,
  stdout,
  traceID,
}: PropsWithChildren<LoggerContainerProps>): ReactElement {
  const [bsodVisible, setBsodVisible] = useState(false);
  const hasCriticalError = useRef(false);

  const stack = useRef<StackRef>({
    actions: logger.getStackCollection().data,
    env,
    ...(typeof onPrepareStack === 'function' ? { onPrepareStack } : {}),
    traceId: typeof traceID === 'string' || typeof traceID === 'number' ? traceID : undefined,
  });

  useEffect(() => {
    logger.setUp({ active });
    logger.getStackCollection().setLimit(limit);
    if (typeof stdout === 'function') {
      logger.setUp({ stdout });
    }
  }, [active, limit, stdout]);

  const buildProps = useCallback(
    () => ({
      ...(typeof onPrepareStack === 'function' ? { onPrepareStack } : {}),
    }),
    [onPrepareStack],
  );

  const getStackDataFn = useCallback(
    (): Stack => getStackData(stack.current as Stack, logger.getStackCollection(), buildProps()),
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
    if (!active || isBackend()) return;

    const onError = (e: ErrorEvent): void => {
      e.preventDefault();
      if (hasCriticalError.current) return;
      hasCriticalError.current = true;
      const stackData = onCriticalError(
        stack.current as Stack,
        logger.getStackCollection(),
        buildProps(),
        e.error as Error,
        e.lineno,
      );
      handleError(stackData);
      setBsodVisible(true);
    };

    window.addEventListener('error', onError);

    return (): void => {
      window.removeEventListener('error', onError);
    };
  }, [active, buildProps, handleError]);

  const contextValue = useMemo(
    () => ({ getStackData: getStackDataFn, onError: handleError }),
    [getStackDataFn, handleError],
  );

  const bsodEnabled = bsod !== false;
  const BsodToRender = typeof bsod === 'function' ? bsod : BsodComponent;

  return (
    <LoggerContext.Provider value={contextValue}>
      {children}
      {bsodEnabled && bsodVisible && (
        <BsodToRender count={logger.getCounter()} onClose={closeBsod} stackData={getStackDataFn()} />
      )}
    </LoggerContext.Provider>
  );
}
