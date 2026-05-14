import { Component, FunctionComponent, ReactElement, createContext, isValidElement, useContext, PropsWithChildren } from 'react';

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

interface ILoggerContainerState {
  bsod: boolean;
}

// eslint-disable-next-line import/no-default-export
export default class LoggerContainer extends Component<
  PropsWithChildren<ILoggerContainerProps>,
  ILoggerContainerState
> {
  private __hasCriticalError = false;

  private readonly stack: {
    actions: IAction[];
    env: { lang?: string; href?: string };
    keyboardPressed: string | null;
    mousePressed: number | null;
    onPrepareStack?: (s: IStack) => IStack;
    session: { start?: string; end?: string };
    sessionId: number | string | undefined;
  };

  constructor(
    props: ILoggerContainerProps = {
      active: true,
      bsodActive: true,
      getCurrentDate,
      limit: 25,
      logger,
      sessionID: false,
    },
  ) {
    super(props);

    this.state = {
      bsod: false,
    };

    this.stack = {
      actions: logger.getStackCollection().data,
      env: {},
      keyboardPressed: null,
      mousePressed: null,
      ...(typeof this.props.onPrepareStack === 'function' ? { onPrepareStack: this.props.onPrepareStack } : {}),
      session: {},
      sessionId: undefined,
    };

    const LIMIT = typeof this.props.limit === 'number' ? this.props.limit : 25;

    logger.setUp({
      active: props.active as boolean,
    });

    logger.getStackCollection().setLimit(LIMIT);

    if (typeof this.props.stdout === 'function') {
      logger.setUp({
        stdout: this.props.stdout,
      });
    }

    this.stack.session.start =
      typeof this.props.getCurrentDate === 'function' ? this.props.getCurrentDate() : getCurrentDate();

    if (typeof this.props.sessionID === 'string' || typeof this.props.sessionID === 'number') {
      this.stack.sessionId = this.props.sessionID;
    }
  }

  override componentDidMount(): void {
    if (this.props.active && !isBackend()) {
      this.bindActions();
      window.addEventListener('error', this.handlerError);
    }
  }

  override componentWillUnmount(): void {
    this.unbindActions();
  }

  handlerError = (e: ErrorEvent): void => {
    const { lineno, error } = e;
    this.unbindActions();
    if (!this.__hasCriticalError) {
      this.__hasCriticalError = true;
      const stackData = onCriticalError(
        this.stack as IStack,
        logger.getStackCollection(),
        {
          ...(typeof this.props.getCurrentDate === 'function' ? { getCurrentDate: this.props.getCurrentDate } : {}),
          ...(typeof this.props.onPrepareStack === 'function' ? { onPrepareStack: this.props.onPrepareStack } : {}),
        },
        error,
        lineno,
      );

      this.onError(stackData);

      this.setState({
        bsod: true,
      });
    }
  };

  _onMouseDown = (e: MouseEvent): void => {
    this.stack.mousePressed = e ? e.button : null;
  };

  _onKeyDown = (e: KeyboardEvent): void => {
    this.stack.keyboardPressed = e ? e.code : null;
  };

  _onKeyUp = (): void => {
    setTimeout(() => {
      this.stack.keyboardPressed = null;
    });
  };

  _onMouseUp = (): void => {
    setTimeout(() => {
      this.stack.mousePressed = null;
    });
  };

  getStackData = (): IStack =>
    getStackData(this.stack as IStack, logger.getStackCollection(), {
      ...(typeof this.props.getCurrentDate === 'function' ? { getCurrentDate: this.props.getCurrentDate } : {}),
      ...(typeof this.props.onPrepareStack === 'function' ? { onPrepareStack: this.props.onPrepareStack } : {}),
    });

  onError = (stackData: IStack): void => {
    if (typeof this.props.onError === 'function') {
      this.props.onError(stackData);
    }
  };

  closeBsod = (): void => {
    this.setState({
      bsod: false,
    });
  };

  bindActions(): void {
    document.addEventListener('mousedown', this._onMouseDown);
    document.addEventListener('mouseup', this._onMouseUp);
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
  }

  unbindActions(): void {
    window.removeEventListener('error', this.handlerError);
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
    document.removeEventListener('mousedown', this._onMouseDown);
    document.removeEventListener('mouseup', this._onMouseUp);
  }

  override render(): ReactElement {
    const Bsod = isValidElement(this.props.bsod) ? this.props.bsod : BsodComponent;

    return (
      <LoggerContext.Provider
        value={{
          getStackData: this.getStackData,
          onError: this.onError,
        }}
      >
        {this.props.children}

        {this.props.bsodActive && this.state.bsod && (
          <Bsod count={logger.getCounter()} onClose={this.closeBsod} stackData={this.getStackData()} />
        )}
      </LoggerContext.Provider>
    );
  }
}
