import {
  FunctionComponent,
  PropsWithChildren,
  ReactElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import BsodComponent, { IBSOD } from './bsod';
import { logger } from './logger';
import { getStackData, onCriticalError } from './stack';
import { IStack, ILogger, IAction } from './types';
import { getCurrentDate } from './utils';

interface ILoggerContext {
  getStackData: () => IStack;
  onError: (stack: IStack) => void;
}

export const LoggerContext = createContext<null | ILoggerContext>(null);

const isBackend = (): boolean => typeof window === 'undefined';

interface ILoggerApi {
  getStackData: () => IStack;
  triggerError: (stack: IStack) => void;
}

export const useLoggerApi = (): ILoggerApi => {
  const ctx = useContext(LoggerContext) as ILoggerContext;

  return {
    getStackData: ctx.getStackData,
    triggerError: ctx.onError,
  };
};

interface ILoggerContainerProps {
  logger?: ILogger;
  active?: boolean;
  bsodActive?: boolean;
  sessionID?: boolean | string | number;
  bsod?: FunctionComponent<IBSOD>;
  limit?: number;
  getCurrentDate?: () => string;
  onError?: (stack: IStack) => void;
  onPrepareStack?: (stack: IStack) => IStack;
  stdout?: (level: string, message: string, important?: boolean) => void;
}

type StackRef = {
  actions: IAction[];
  env: { lang?: string; href?: string };
  keyboardPressed: string | null;
  mousePressed: number | null;
  onPrepareStack?: (s: IStack) => IStack;
  session: { start?: string; end?: string };
  sessionId: number | string | undefined;
};

// eslint-disable-next-line import/no-default-export
export default function LoggerContainer({
  active = true,
  bsodActive = true,
  sessionID,
  bsod: BsodProp,
  limit = 25,
  getCurrentDate: getCurrentDateFn,
  onError: onErrorCallback,
  onPrepareStack,
  stdout,
  children,
}: PropsWithChildren<ILoggerContainerProps>): ReactElement {
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
    (): IStack => getStackData(stack.current as IStack, logger.getStackCollection(), buildProps()),
    [buildProps],
  );

  const handleError = useCallback(
    (stackData: IStack): void => {
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
        stack.current as IStack,
        logger.getStackCollection(),
        buildProps(),
        e.error,
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

    return () => {
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
