var _div, _LoggerContainer, _div2, _LoggerContainer2, _div3, _LoggerContainer3, _LoggerContainer4, _div4, _div5;
import { c as _c } from "react/compiler-runtime";
import { act, render, renderHook, screen } from '@testing-library/react';
import { logger } from "./logger.mjs";
import LoggerContainer, { useLoggerApi } from "./logger-container.mjs";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const createWrapper = (props = {}) => ({
  children
}) => /*#__PURE__*/_jsx(LoggerContainer, {
  ...props,
  children: children
});
const fireWindowError = (message = 'test error', lineno = 1) => {
  act(() => {
    window.dispatchEvent(new ErrorEvent('error', {
      error: new Error(message),
      lineno
    }));
  });
};
afterEach(() => {
  logger.setUp({
    active: true
  });
});
describe('LoggerContainer', () => {
  describe('negative cases', () => {
    it('does not call stdout when logger is inactive', () => {
      const stdout = jest.fn();
      render(/*#__PURE__*/_jsx(LoggerContainer, {
        active: false,
        stdout: stdout,
        children: _div || (_div = /*#__PURE__*/_jsx("div", {}))
      }));
      logger.log('test');
      expect(stdout).not.toHaveBeenCalled();
    });
    it('does not render BSOD when bsodActive is false', () => {
      render(_LoggerContainer || (_LoggerContainer = /*#__PURE__*/_jsx(LoggerContainer, {
        bsodActive: false,
        children: /*#__PURE__*/_jsx("div", {})
      })));
      fireWindowError();
      expect(screen.queryByText('Actions:')).not.toBeInTheDocument();
    });
    it('handles only the first window error — subsequent errors are ignored', () => {
      const onError = jest.fn();
      render(/*#__PURE__*/_jsx(LoggerContainer, {
        onError: onError,
        children: _div2 || (_div2 = /*#__PURE__*/_jsx("div", {}))
      }));
      fireWindowError('first');
      fireWindowError('second');
      expect(onError).toHaveBeenCalledTimes(1);
    });
    it('does not throw when triggerError is called without an onError prop', () => {
      const {
        result
      } = renderHook(() => useLoggerApi(), {
        wrapper: createWrapper()
      });
      expect(() => {
        act(() => {
          result.current.triggerError(result.current.getStackData());
        });
      }).not.toThrow();
    });
    it('throws when useLoggerApi is called outside LoggerContext', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockReturnValue(undefined);
      expect(() => renderHook(() => useLoggerApi())).toThrow();
      consoleSpy.mockRestore();
    });
    it('leaves sessionId undefined when sessionID prop is a boolean', () => {
      const {
        result
      } = renderHook(() => useLoggerApi(), {
        wrapper: ({
          children
        }) => /*#__PURE__*/_jsx(LoggerContainer, {
          sessionID: false,
          children: children
        })
      });
      expect(result.current.getStackData().sessionId).toBeUndefined();
    });
    it('does not attach event listeners when active is false', () => {
      const addSpy = jest.spyOn(document, 'addEventListener');
      render(_LoggerContainer2 || (_LoggerContainer2 = /*#__PURE__*/_jsx(LoggerContainer, {
        active: false,
        children: /*#__PURE__*/_jsx("div", {})
      })));
      expect(addSpy).not.toHaveBeenCalledWith('mousedown', expect.any(Function));
      addSpy.mockRestore();
    });
  });
  describe('positive cases', () => {
    ['log', 'info', 'debug', 'warn', 'error'].forEach(method => {
      it(`calls stdout with correct args on logger.${method}`, () => {
        const stdout = jest.fn();
        render(/*#__PURE__*/_jsx(LoggerContainer, {
          stdout: stdout,
          children: _div3 || (_div3 = /*#__PURE__*/_jsx("div", {}))
        }));
        logger[method](`test ${method} message`);
        expect(stdout).toHaveBeenCalledWith(method, `test ${method} message`, false);
      });
    });
    it('getStackData returns actions that were logged', () => {
      const {
        result
      } = renderHook(() => useLoggerApi(), {
        wrapper: createWrapper()
      });
      logger.log('unique-getstack-msg');
      expect(result.current.getStackData().actions).toContainEqual({
        log: 'unique-getstack-msg'
      });
    });
    it('triggerError invokes onError with an Stack', () => {
      const onError = jest.fn();
      const {
        result
      } = renderHook(() => useLoggerApi(), {
        wrapper: createWrapper({
          onError
        })
      });
      act(() => {
        result.current.triggerError(result.current.getStackData());
      });
      expect(onError).toHaveBeenCalledTimes(1);
      const [firstCall] = onError.mock.calls;
      expect(firstCall[0]).toHaveProperty('actions');
    });
    it('sets sessionId when sessionID prop is a string', () => {
      const {
        result
      } = renderHook(() => useLoggerApi(), {
        wrapper: ({
          children
        }) => /*#__PURE__*/_jsx(LoggerContainer, {
          sessionID: "my-session",
          children: children
        })
      });
      expect(result.current.getStackData().sessionId).toBe('my-session');
    });
    it('sets sessionId when sessionID prop is a number', () => {
      const {
        result
      } = renderHook(() => useLoggerApi(), {
        wrapper: ({
          children
        }) => /*#__PURE__*/_jsx(LoggerContainer, {
          sessionID: 42,
          children: children
        })
      });
      expect(result.current.getStackData().sessionId).toBe(42);
    });
    it('uses custom getCurrentDate for session.start', () => {
      const {
        result
      } = renderHook(() => useLoggerApi(), {
        wrapper: ({
          children
        }) => /*#__PURE__*/_jsx(LoggerContainer, {
          getCurrentDate: () => 'custom-start',
          children: children
        })
      });
      expect(result.current.getStackData().session.start).toBe('custom-start');
    });
    it('uses custom getCurrentDate for session.end', () => {
      const {
        result
      } = renderHook(() => useLoggerApi(), {
        wrapper: ({
          children
        }) => /*#__PURE__*/_jsx(LoggerContainer, {
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
      } = renderHook(() => useLoggerApi(), {
        wrapper: ({
          children
        }) => /*#__PURE__*/_jsx(LoggerContainer, {
          onPrepareStack: onPrepareStack,
          children: children
        })
      });
      result.current.getStackData();
      expect(onPrepareStack).toHaveBeenCalledTimes(1);
    });
    it('limits the stack size to the limit prop', () => {
      render(_LoggerContainer3 || (_LoggerContainer3 = /*#__PURE__*/_jsx(LoggerContainer, {
        limit: 2,
        children: /*#__PURE__*/_jsx("div", {})
      })));
      logger.log('a');
      logger.log('b');
      logger.log('c');
      expect(logger.getStackCollection().getData().length).toBeLessThanOrEqual(2);
    });
    it('renders BSOD after a window error event', () => {
      render(_LoggerContainer4 || (_LoggerContainer4 = /*#__PURE__*/_jsx(LoggerContainer, {
        children: /*#__PURE__*/_jsx("div", {})
      })));
      fireWindowError();
      expect(screen.getByText('Actions:')).toBeInTheDocument();
    });
    it('calls onError when a window error event fires', () => {
      const onError = jest.fn();
      render(/*#__PURE__*/_jsx(LoggerContainer, {
        onError: onError,
        children: _div4 || (_div4 = /*#__PURE__*/_jsx("div", {}))
      }));
      fireWindowError('crash message', 42);
      expect(onError).toHaveBeenCalledTimes(1);
      const [[stackData]] = onError.mock.calls;
      expect(stackData.actions.some(a => 'critical' in a)).toBe(true);
    });
    it('uses the custom bsod component when the bsod prop is provided', () => {
      const CustomBsod = t0 => {
        const $ = _c(2);
        const {
          count
        } = t0;
        let t1;
        if ($[0] !== count) {
          t1 = /*#__PURE__*/_jsxs("div", {
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
      render(/*#__PURE__*/_jsx(LoggerContainer, {
        bsod: CustomBsod,
        children: _div5 || (_div5 = /*#__PURE__*/_jsx("div", {}))
      }));
      fireWindowError();
      expect(screen.getByTestId('custom-bsod')).toBeInTheDocument();
    });
    it('records mousePressed in stack data on mousedown', () => {
      const {
        result
      } = renderHook(() => useLoggerApi(), {
        wrapper: createWrapper()
      });
      act(() => {
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
      } = renderHook(() => useLoggerApi(), {
        wrapper: createWrapper()
      });
      act(() => {
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
      } = renderHook(() => useLoggerApi(), {
        wrapper: createWrapper()
      });
      act(() => {
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
      } = renderHook(() => useLoggerApi(), {
        wrapper: createWrapper()
      });
      act(() => {
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