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
import { getCurrentDate } from './helpers/utils';
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
  bsod?: FunctionComponent<BsodProps>;
  bsodActive?: boolean;
  getCurrentDate?: () => string;
  limit?: number;
  logger?: LoggerInstance;
  onError?: (stack: Stack) => void;
  onPrepareStack?: (stack: Stack) => Stack;
  sessionID?: boolean | number | string;
  stdout?: Stdout;
}

interface StackRef {
  actions: LogEntry[];
  env: { href?: string; lang?: string };
  keyboardPressed: null | string;
  mousePressed: null | number;
  onPrepareStack?: (s: Stack) => Stack;
  session: { end?: string; start?: string };
  sessionId: number | string | undefined;
}

export default function LoggerContainer({
  active = true,
  bsod: BsodProp,
  bsodActive = true,
  children,
  getCurrentDate: getCurrentDateFn,
  limit = 25,
  onError: onErrorCallback,
  onPrepareStack,
  sessionID,
  stdout,
}: PropsWithChildren<LoggerContainerProps>): ReactElement {
  const [bsodVisible, setBsodVisible] = useState(false);
  const hasCriticalError = useRef(false);

  const stack = useRef<StackRef>({
    actions: logger.getStackCollection().data,
    env: {},
    keyboardPressed: null,
    mousePressed: null,
    ...(typeof onPrepareStack === 'function' ? { onPrepareStack } : {}),
    session: {
      start: typeof getCurrentDateFn === 'function' ? getCurrentDateFn() : getCurrentDate(),
    },
    sessionId: typeof sessionID === 'string' || typeof sessionID === 'number' ? sessionID : undefined,
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
      ...(typeof getCurrentDateFn === 'function' ? { getCurrentDate: getCurrentDateFn } : {}),
      ...(typeof onPrepareStack === 'function' ? { onPrepareStack } : {}),
    }),
    [getCurrentDateFn, onPrepareStack],
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

    const onMouseDown = (e: MouseEvent): void => {
      stack.current.mousePressed = e.button;
    };
    const onMouseUp = (): void => {
      setTimeout(() => {
        stack.current.mousePressed = null;
      });
    };
    const onKeyDown = (e: KeyboardEvent): void => {
      stack.current.keyboardPressed = e.code;
    };
    const onKeyUp = (): void => {
      setTimeout(() => {
        stack.current.keyboardPressed = null;
      });
    };
    const onError = (e: ErrorEvent): void => {
      e.preventDefault();
      if (hasCriticalError.current) return;
      hasCriticalError.current = true;
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
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

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('error', onError);

    return (): void => {
      window.removeEventListener('error', onError);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [active, buildProps, handleError]);

  const contextValue = useMemo(
    () => ({ getStackData: getStackDataFn, onError: handleError }),
    [getStackDataFn, handleError],
  );

  const Bsod = typeof BsodProp === 'function' ? BsodProp : BsodComponent;

  return (
    <LoggerContext.Provider value={contextValue}>
      {children}
      {bsodActive && bsodVisible && (
        <Bsod count={logger.getCounter()} onClose={closeBsod} stackData={getStackDataFn()} />
      )}
    </LoggerContext.Provider>
  );
}
