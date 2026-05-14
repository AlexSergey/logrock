import LimitedArray from "./helpers/limited-array.mjs";
/**
 * Types:
 * log
 * info
 * warn
 * error
 * debug
 * */

class Logger {
  active = true;
  _count = 0;
  ignoreLogging = false;
  constructor() {
    this.stackCollection = new LimitedArray();
  }
  _handler(message, level, important) {
    if (!this.ignoreLogging && this.active) {
      if (typeof this.stdout === 'function') {
        this.stdout(level, message, important);
      }
      let stackData;
      if (typeof message === 'string') {
        const temp = {};
        temp[level] = message;
        stackData = temp;
      } else if (typeof message === 'object') {
        stackData = message;
      }
      if (stackData) {
        this.stackCollection.add({
          ...stackData
        });
      }
      this._count += 1;
    }
  }
  debug(message, important) {
    this._handler(message, 'debug', !!important);
  }
  error(message, important) {
    this._handler(message, 'error', !!important);
  }
  getCounter = () => this._count;
  getStackCollection = () => this.stackCollection;
  info(message, important) {
    this._handler(message, 'info', !!important);
  }
  log(message, important) {
    this._handler(message, 'log', !!important);
  }
  setUp(props) {
    if (typeof props.active === 'boolean') {
      this.active = Boolean(props.active);
    }
    if (typeof props.stdout === 'function') {
      this.stdout = props.stdout;
    }
  }
  warn(message, important) {
    this._handler(message, 'warn', !!important);
  }
}
export const createLogger = () => new Logger();
export const logger = createLogger();