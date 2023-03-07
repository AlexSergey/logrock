import { Component, FunctionComponent, createContext, isValidElement, useContext, PropsWithChildren } from 'react';
import { isString, isNumber, isFunction } from 'valid-types';

import BsodComponent, { IBSOD } from './bsod';
import { logger } from './logger';
import { getStackData, onCriticalError } from './stack';
import { IStack, ILogger } from './types';
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

  private readonly stack;

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
      onPrepareStack: typeof this.props.onPrepareStack === 'function' ? this.props.onPrepareStack : (): void => {},
      session: {},
      sessionId: undefined,
    };

    const LIMIT = isNumber(this.props.limit) ? this.props.limit : 25;

    logger.setUp({
      active: props.active as boolean,
    });

    logger.getStackCollection().setLimit(LIMIT as number);

    if (isFunction(this.props.stdout)) {
      logger.setUp({
        stdout: this.props.stdout,
      });
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.stack.session.start = isFunction(this.props.getCurrentDate) ? this.props.getCurrentDate() : getCurrentDate();

    if (isString(this.props.sessionID) || isNumber(this.props.sessionID)) {
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
        this.stack,
        logger.getStackCollection(),
        {
          getCurrentDate: this.props.getCurrentDate,
          onPrepareStack: this.props.onPrepareStack,
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
    this.stack.mousePressed = e && e.button;
  };

  _onKeyDown = (e: KeyboardEvent): void => {
    this.stack.keyboardPressed = e && e.code;
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
    getStackData(this.stack, logger.getStackCollection(), {
      getCurrentDate: this.props.getCurrentDate,
      onPrepareStack: this.props.onPrepareStack,
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

  override render(): JSX.Element {
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
