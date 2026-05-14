"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LoggerContext = void 0;
exports.default = LoggerContainer;
exports.useLoggerApi = void 0;
var _compilerRuntime = require("react/compiler-runtime");
var _react = require("react");
var _bsod = _interopRequireDefault(require("./components/bsod.cjs"));
var _stack = require("./helpers/stack.cjs");
var _utils = require("./helpers/utils.cjs");
var _logger = require("./logger.cjs");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const LoggerContext = exports.LoggerContext = /*#__PURE__*/(0, _react.createContext)(null);
const isBackend = () => typeof window === 'undefined';
const useLoggerApi = () => {
  const $ = (0, _compilerRuntime.c)(3);
  const ctx = (0, _react.useContext)(LoggerContext);
  let t0;
  if ($[0] !== ctx.getStackData || $[1] !== ctx.onError) {
    t0 = {
      getStackData: ctx.getStackData,
      triggerError: ctx.onError
    };
    $[0] = ctx.getStackData;
    $[1] = ctx.onError;
    $[2] = t0;
  } else {
    t0 = $[2];
  }
  return t0;
};
exports.useLoggerApi = useLoggerApi;
function LoggerContainer({
  active = true,
  bsod: BsodProp,
  bsodActive = true,
  children,
  getCurrentDate: getCurrentDateFn,
  limit = 25,
  onError: onErrorCallback,
  onPrepareStack,
  sessionID,
  stdout
}) {
  const [bsodVisible, setBsodVisible] = (0, _react.useState)(false);
  const hasCriticalError = (0, _react.useRef)(false);
  const stack = (0, _react.useRef)({
    actions: _logger.logger.getStackCollection().data,
    env: {},
    keyboardPressed: null,
    mousePressed: null,
    ...(typeof onPrepareStack === 'function' ? {
      onPrepareStack
    } : {}),
    session: {
      start: typeof getCurrentDateFn === 'function' ? getCurrentDateFn() : (0, _utils.getCurrentDate)()
    },
    sessionId: typeof sessionID === 'string' || typeof sessionID === 'number' ? sessionID : undefined
  });
  (0, _react.useEffect)(() => {
    _logger.logger.setUp({
      active
    });
    _logger.logger.getStackCollection().setLimit(limit);
    if (typeof stdout === 'function') {
      _logger.logger.setUp({
        stdout
      });
    }
  }, [active, limit, stdout]);
  const buildProps = (0, _react.useCallback)(() => ({
    ...(typeof getCurrentDateFn === 'function' ? {
      getCurrentDate: getCurrentDateFn
    } : {}),
    ...(typeof onPrepareStack === 'function' ? {
      onPrepareStack
    } : {})
  }), [getCurrentDateFn, onPrepareStack]);
  const getStackDataFn = (0, _react.useCallback)(() => (0, _stack.getStackData)(stack.current, _logger.logger.getStackCollection(), buildProps()), [buildProps]);
  const handleError = (0, _react.useCallback)(stackData => {
    if (typeof onErrorCallback === 'function') {
      onErrorCallback(stackData);
    }
  }, [onErrorCallback]);
  const closeBsod = (0, _react.useCallback)(() => {
    setBsodVisible(false);
  }, []);
  (0, _react.useEffect)(() => {
    if (!active || isBackend()) return;
    const onMouseDown = e => {
      stack.current.mousePressed = e.button;
    };
    const onMouseUp = () => {
      setTimeout(() => {
        stack.current.mousePressed = null;
      });
    };
    const onKeyDown = e_0 => {
      stack.current.keyboardPressed = e_0.code;
    };
    const onKeyUp = () => {
      setTimeout(() => {
        stack.current.keyboardPressed = null;
      });
    };
    const onError = e_1 => {
      e_1.preventDefault();
      if (hasCriticalError.current) return;
      hasCriticalError.current = true;
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      const stackData_0 = (0, _stack.onCriticalError)(stack.current, _logger.logger.getStackCollection(), buildProps(), e_1.error, e_1.lineno);
      handleError(stackData_0);
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
  const contextValue = (0, _react.useMemo)(() => ({
    getStackData: getStackDataFn,
    onError: handleError
  }), [getStackDataFn, handleError]);
  const Bsod = typeof BsodProp === 'function' ? BsodProp : _bsod.default;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(LoggerContext.Provider, {
    value: contextValue,
    children: [children, bsodActive && bsodVisible && /*#__PURE__*/(0, _jsxRuntime.jsx)(Bsod, {
      count: _logger.logger.getCounter(),
      onClose: closeBsod,
      stackData: getStackDataFn()
    })]
  });
}