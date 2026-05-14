"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logger = exports.createLogger = void 0;
var _limitedArray = _interopRequireDefault(require("./helpers/limited-array.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
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
    this.stackCollection = new _limitedArray.default();
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
const createLogger = () => new Logger();
exports.createLogger = createLogger;
const logger = exports.logger = createLogger();