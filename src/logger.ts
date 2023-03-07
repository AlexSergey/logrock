import LimitedArray from 'limited-array';
import { isFunction } from 'valid-types';

import { StackData, IAction, ILogger } from './types';

/**
 * Types:
 * log
 * info
 * warn
 * error
 * debug
 * */

class Logger {
  public active = true;

  public stdout?: (level: string, message: string, important: boolean) => void = null;

  private ignoreLogging = false;

  private stackCollection: LimitedArray<IAction>;

  private _count = 0;

  constructor() {
    this.stackCollection = new LimitedArray<IAction>();
  }

  log(message: string, important?: boolean): void {
    this._handler(message, 'log', !!important);
  }

  info(message: string, important?: boolean): void {
    this._handler(message, 'info', !!important);
  }

  debug(message: string, important?: boolean): void {
    this._handler(message, 'debug', !!important);
  }

  warn(message: string, important?: boolean): void {
    this._handler(message, 'warn', !!important);
  }

  error(message: string, important?: boolean): void {
    this._handler(message, 'error', !!important);
  }

  setUp(props: { active?: boolean; stdout?: (level: string, message: string, important?: boolean) => void }): void {
    if (typeof props.active === 'boolean') {
      this.active = Boolean(props.active);
    }
    if (typeof props.stdout === 'function') {
      this.stdout = props.stdout;
    }
  }

  _handler(message: string, level: string, important: boolean): void {
    if (!this.ignoreLogging && this.active) {
      if (isFunction(this.stdout)) {
        this.stdout(level, message, important);
      }

      let stackData: StackData;

      if (typeof message === 'string') {
        const temp = {};
        temp[level] = message;
        stackData = temp as StackData;
      } else if (typeof message === 'object') {
        stackData = message;
      }

      if (stackData) {
        this.stackCollection.add({ ...stackData });
      }
      this._count += 1;
    }
  }

  getCounter = (): number => this._count;

  getStackCollection = (): LimitedArray<IAction> => this.stackCollection;
}

export const createLogger = (): ILogger => new Logger();

export const logger = createLogger();
