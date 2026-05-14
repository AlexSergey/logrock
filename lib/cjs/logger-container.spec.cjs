"use strict";

var _compilerRuntime = require("react/compiler-runtime");
var _react = require("@testing-library/react");
var _logger = require("./logger.cjs");
var _loggerContainer = _interopRequireWildcard(require("./logger-container.cjs"));
var _jsxRuntime = require("react/jsx-runtime");
var _div, _LoggerContainer, _div2, _LoggerContainer2, _div3, _LoggerContainer3, _LoggerContainer4, _div4, _div5;
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const createWrapper = (props = {}) => ({
  children
}) => /*#__PURE__*/(0, _jsxRuntime.jsx)(_loggerContainer.default, {
  ...props,
  children: children
});
const fireWindowError = (message = 'test error', lineno = 1) => {
  (0, _react.act)(() => {
    window.dispatchEvent(new ErrorEvent('error', {
      error: new Error(message),
      lineno
    }));
  });
};
afterEach(() => {
  _logger.logger.setUp({
    active: true
  });
});
describe('LoggerContainer', () => {
  describe('negative cases', () => {
    it('does not call stdout when logger is inactive', () => {
      const stdout = jest.fn();
      (0, _react.render)(/*#__PURE__*/(0, _jsxRuntime.jsx)(_loggerContainer.default, {
        active: false,
        stdout: stdout,
        children: _div || (_div = /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {}))
      }));
      _logger.logger.log('test');
      expect(stdout).not.toHaveBeenCalled();
    });
    it('does not render BSOD when bsodActive is false', () => {
      (0, _react.render)(_LoggerContainer || (_LoggerContainer = /*#__PURE__*/(0, _jsxRuntime.jsx)(_loggerContainer.default, {
        bsodActive: false,
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {})
      })));
      fireWindowError();
      expect(_react.screen.queryByText('Actions:')).not.toBeInTheDocument();
    });
    it('handles only the first window error — subsequent errors are ignored', () => {
      const onError = jest.fn();
      (0, _react.render)(/*#__PURE__*/(0, _jsxRuntime.jsx)(_loggerContainer.default, {
        onError: onError,
        children: _div2 || (_div2 = /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {}))
      }));
      fireWindowError('first');
      fireWindowError('second');
      expect(onError).toHaveBeenCalledTimes(1);
    });
    it('does not throw when triggerError is called without an onError prop', () => {
      const {
        result
      } = (0, _react.renderHook)(() => (0, _loggerContainer.useLoggerApi)(), {
        wrapper: createWrapper()
      });
      expect(() => {
        (0, _react.act)(() => {
          result.current.triggerError(result.current.getStackData());
        });
      }).not.toThrow();
    });
    it('throws when useLoggerApi is called outside LoggerContext', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockReturnValue(undefined);
      expect(() => (0, _react.renderHook)(() => (0, _loggerContainer.useLoggerApi)())).toThrow();
      consoleSpy.mockRestore();
    });
    it('leaves sessionId undefined when sessionID prop is a boolean', () => {
      const {
        result
      } = (0, _react.renderHook)(() => (0, _loggerContainer.useLoggerApi)(), {
        wrapper: ({
          children
        }) => /*#__PURE__*/(0, _jsxRuntime.jsx)(_loggerContainer.default, {
          sessionID: false,
          children: children
        })
      });
      expect(result.current.getStackData().sessionId).toBeUndefined();
    });
    it('does not attach event listeners when active is false', () => {
      const addSpy = jest.spyOn(document, 'addEventListener');
      (0, _react.render)(_LoggerContainer2 || (_LoggerContainer2 = /*#__PURE__*/(0, _jsxRuntime.jsx)(_loggerContainer.default, {
        active: false,
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {})
      })));
      expect(addSpy).not.toHaveBeenCalledWith('mousedown', expect.any(Function));
      addSpy.mockRestore();
    });
  });
  describe('positive cases', () => {
    ['log', 'info', 'debug', 'warn', 'error'].forEach(method => {
      it(`calls stdout with correct args on logger.${method}`, () => {
        const stdout = jest.fn();
        (0, _react.render)(/*#__PURE__*/(0, _jsxRuntime.jsx)(_loggerContainer.default, {
          stdout: stdout,
          children: _div3 || (_div3 = /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {}))
        }));
        _logger.logger[method](`test ${method} message`);
        expect(stdout).toHaveBeenCalledWith(method, `test ${method} message`, false);
      });
    });
    it('getStackData returns actions that were logged', () => {
      const {
        result
      } = (0, _react.renderHook)(() => (0, _loggerContainer.useLoggerApi)(), {
        wrapper: createWrapper()
      });
      _logger.logger.log('unique-getstack-msg');
      expect(result.current.getStackData().actions).toContainEqual({
        log: 'unique-getstack-msg'
      });
    });
    it('triggerError invokes onError with an Stack', () => {
      const onError = jest.fn();
      const {
        result
      } = (0, _react.renderHook)(() => (0, _loggerContainer.useLoggerApi)(), {
        wrapper: createWrapper({
          onError
        })
      });
      (0, _react.act)(() => {
        result.current.triggerError(result.current.getStackData());
      });
      expect(onError).toHaveBeenCalledTimes(1);
      const [firstCall] = onError.mock.calls;
      expect(firstCall[0]).toHaveProperty('actions');
    });
    it('sets sessionId when sessionID prop is a string', () => {
      const {
        result
      } = (0, _react.renderHook)(() => (0, _loggerContainer.useLoggerApi)(), {
        wrapper: ({
          children
        }) => /*#__PURE__*/(0, _jsxRuntime.jsx)(_loggerContainer.default, {
          sessionID: "my-session",
          children: children
        })
      });
      expect(result.current.getStackData().sessionId).toBe('my-session');
    });
    it('sets sessionId when sessionID prop is a number', () => {
      const {
        result
      } = (0, _react.renderHook)(() => (0, _loggerContainer.useLoggerApi)(), {
        wrapper: ({
          children
        }) => /*#__PURE__*/(0, _jsxRuntime.jsx)(_loggerContainer.default, {
          sessionID: 42,
          children: children
        })
      });
      expect(result.current.getStackData().sessionId).toBe(42);
    });
    it('uses custom getCurrentDate for session.start', () => {
      const {
        result
      } = (0, _react.renderHook)(() => (0, _loggerContainer.useLoggerApi)(), {
        wrapper: ({
          children
        }) => /*#__PURE__*/(0, _jsxRuntime.jsx)(_loggerContainer.default, {
          getCurrentDate: () => 'custom-start',
          children: children
        })
      });
      expect(result.current.getStackData().session.start).toBe('custom-start');
    });
    it('uses custom getCurrentDate for session.end', () => {
      const {
        result
      } = (0, _react.renderHook)(() => (0, _loggerContainer.useLoggerApi)(), {
        wrapper: ({
          children
        }) => /*#__PURE__*/(0, _jsxRuntime.jsx)(_loggerContainer.default, {
          getCurrentDate: () => 'custom-end',
          children: children
        })
      });
      expect(result.current.getStackData().session.end).toBe('custom-end');
    });
    it('calls onPrepareStack when getStackData is invoked', () => {
      const onPrepareStack = jest.fn(s => s);
      const {
        result
      } = (0, _react.renderHook)(() => (0, _loggerContainer.useLoggerApi)(), {
        wrapper: ({
          children
        }) => /*#__PURE__*/(0, _jsxRuntime.jsx)(_loggerContainer.default, {
          onPrepareStack: onPrepareStack,
          children: children
        })
      });
      result.current.getStackData();
      expect(onPrepareStack).toHaveBeenCalledTimes(1);
    });
    it('limits the stack size to the limit prop', () => {
      (0, _react.render)(_LoggerContainer3 || (_LoggerContainer3 = /*#__PURE__*/(0, _jsxRuntime.jsx)(_loggerContainer.default, {
        limit: 2,
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {})
      })));
      _logger.logger.log('a');
      _logger.logger.log('b');
      _logger.logger.log('c');
      expect(_logger.logger.getStackCollection().getData().length).toBeLessThanOrEqual(2);
    });
    it('renders BSOD after a window error event', () => {
      (0, _react.render)(_LoggerContainer4 || (_LoggerContainer4 = /*#__PURE__*/(0, _jsxRuntime.jsx)(_loggerContainer.default, {
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {})
      })));
      fireWindowError();
      expect(_react.screen.getByText('Actions:')).toBeInTheDocument();
    });
    it('calls onError when a window error event fires', () => {
      const onError = jest.fn();
      (0, _react.render)(/*#__PURE__*/(0, _jsxRuntime.jsx)(_loggerContainer.default, {
        onError: onError,
        children: _div4 || (_div4 = /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {}))
      }));
      fireWindowError('crash message', 42);
      expect(onError).toHaveBeenCalledTimes(1);
      const [[stackData]] = onError.mock.calls;
      expect(stackData.actions.some(a => 'critical' in a)).toBe(true);
    });
    it('uses the custom bsod component when the bsod prop is provided', () => {
      const CustomBsod = t0 => {
        const $ = (0, _compilerRuntime.c)(2);
        const {
          count
        } = t0;
        let t1;
        if ($[0] !== count) {
          t1 = /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
            "data-testid": "custom-bsod",
            children: ["count:", count]
          });
          $[0] = count;
          $[1] = t1;
        } else {
          t1 = $[1];
        }
        return t1;
      };
      (0, _react.render)(/*#__PURE__*/(0, _jsxRuntime.jsx)(_loggerContainer.default, {
        bsod: CustomBsod,
        children: _div5 || (_div5 = /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {}))
      }));
      fireWindowError();
      expect(_react.screen.getByTestId('custom-bsod')).toBeInTheDocument();
    });
    it('records mousePressed in stack data on mousedown', () => {
      const {
        result
      } = (0, _react.renderHook)(() => (0, _loggerContainer.useLoggerApi)(), {
        wrapper: createWrapper()
      });
      (0, _react.act)(() => {
        document.dispatchEvent(new MouseEvent('mousedown', {
          button: 2
        }));
      });
      expect(result.current.getStackData().mousePressed).toBe(2);
    });
    it('resets mousePressed to null after mouseup', () => {
      jest.useFakeTimers();
      const {
        result
      } = (0, _react.renderHook)(() => (0, _loggerContainer.useLoggerApi)(), {
        wrapper: createWrapper()
      });
      (0, _react.act)(() => {
        document.dispatchEvent(new MouseEvent('mousedown', {
          button: 1
        }));
        document.dispatchEvent(new MouseEvent('mouseup'));
        jest.runAllTimers();
      });
      expect(result.current.getStackData().mousePressed).toBeNull();
      jest.useRealTimers();
    });
    it('records keyboardPressed in stack data on keydown', () => {
      const {
        result
      } = (0, _react.renderHook)(() => (0, _loggerContainer.useLoggerApi)(), {
        wrapper: createWrapper()
      });
      (0, _react.act)(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', {
          code: 'KeyA'
        }));
      });
      expect(result.current.getStackData().keyboardPressed).toBe('KeyA');
    });
    it('resets keyboardPressed to null after keyup', () => {
      jest.useFakeTimers();
      const {
        result
      } = (0, _react.renderHook)(() => (0, _loggerContainer.useLoggerApi)(), {
        wrapper: createWrapper()
      });
      (0, _react.act)(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', {
          code: 'ShiftLeft'
        }));
        document.dispatchEvent(new KeyboardEvent('keyup'));
        jest.runAllTimers();
      });
      expect(result.current.getStackData().keyboardPressed).toBeNull();
      jest.useRealTimers();
    });
  });
});