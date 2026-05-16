import type { PropsWithChildren, ReactElement } from 'react';

import { act, render, renderHook, screen } from '@testing-library/react';

import type { BsodProps } from './components/bsod';

import { logger } from './logger';
import { LoggerContainer, useLoggerApi } from './logger-container';
import { LoggerLevels, type Stack } from './types';

interface WrapperProps {
  onError?: (s: Stack) => void;
  stdout?: (level: string, message: string, ctx: string, important: boolean) => void;
}

const createWrapper =
  (props: WrapperProps = {}) =>
  ({ children }: PropsWithChildren): ReactElement => <LoggerContainer {...props}>{children}</LoggerContainer>;

const fireWindowError = (message = 'test error', lineno = 1): void => {
  act(() => {
    window.dispatchEvent(new ErrorEvent('error', { error: new Error(message), lineno }));
  });
};

const fireUnhandledRejection = (reason: unknown = new Error('promise error')): void => {
  act(() => {
    window.dispatchEvent(new PromiseRejectionEvent('unhandledrejection', { promise: Promise.resolve(), reason }));
  });
};

afterEach(() => {
  logger.setUp({ enabled: true });
  logger.getStackCollection().reset();
});

describe('LoggerContainer', () => {
  describe('negative cases', () => {
    it('does not call stdout when logger is disabled', () => {
      const stdout = jest.fn();
      render(
        <LoggerContainer enabled={false} stdout={stdout}>
          <div />
        </LoggerContainer>,
      );
      logger.log('test');
      expect(stdout).not.toHaveBeenCalled();
    });

    it('does not render BSOD when bsod={false}', () => {
      render(
        <LoggerContainer bsod={false}>
          <div />
        </LoggerContainer>,
      );
      fireWindowError();
      expect(screen.queryByText('Actions:')).not.toBeInTheDocument();
    });

    it('handles only the first window error — subsequent errors are ignored', () => {
      const onError = jest.fn();
      render(
        <LoggerContainer onError={onError}>
          <div />
        </LoggerContainer>,
      );
      fireWindowError('first');
      fireWindowError('second');
      expect(onError).toHaveBeenCalledTimes(1);
    });

    it('handles only the first unhandledrejection — subsequent rejections are ignored', () => {
      const onError = jest.fn();
      render(
        <LoggerContainer onError={onError}>
          <div />
        </LoggerContainer>,
      );
      fireUnhandledRejection(new Error('first'));
      fireUnhandledRejection(new Error('second'));
      expect(onError).toHaveBeenCalledTimes(1);
    });

    it('does not attach listeners when enabled is false', () => {
      const addSpy = jest.spyOn(window, 'addEventListener');
      render(
        <LoggerContainer enabled={false}>
          <div />
        </LoggerContainer>,
      );
      expect(addSpy).not.toHaveBeenCalledWith('error', expect.any(Function));
      expect(addSpy).not.toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
      addSpy.mockRestore();
    });

    it('does not throw when triggerError is called without an onError prop', () => {
      const { result } = renderHook(() => useLoggerApi(), { wrapper: createWrapper() });
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

    it('leaves traceId undefined when traceId prop is omitted', () => {
      const { result } = renderHook(() => useLoggerApi(), {
        wrapper: ({ children }: PropsWithChildren) => <LoggerContainer>{children}</LoggerContainer>,
      });
      expect(result.current.getStackData().traceId).toBeUndefined();
    });
  });

  describe('positive cases', () => {
    (['log', 'info', 'debug', 'warn', 'error'] as const).forEach((method) => {
      it(`calls stdout with correct args on logger.${method}`, () => {
        const stdout = jest.fn();
        render(
          <LoggerContainer stdout={stdout}>
            <div />
          </LoggerContainer>,
        );
        logger[method](`test ${method} message`);
        expect(stdout).toHaveBeenCalledWith(method, `test ${method} message`, '', false);
      });
    });

    it('calls stdout with ctx when logger method receives a ctx argument', () => {
      const stdout = jest.fn();
      render(
        <LoggerContainer stdout={stdout}>
          <div />
        </LoggerContainer>,
      );
      logger.log('msg', 'MyComponent');
      expect(stdout).toHaveBeenCalledWith('log', 'msg', 'MyComponent', false);
    });

    it('getStackData returns actions that were logged', () => {
      const { result } = renderHook(() => useLoggerApi(), { wrapper: createWrapper() });
      logger.log('unique-getstack-msg');
      expect(result.current.getStackData().actions).toContainEqual({
        ctx: '',
        level: 'log',
        message: 'unique-getstack-msg',
        payload: {},
      });
    });

    it('triggerError invokes onError with a Stack', () => {
      const onError = jest.fn();
      const { result } = renderHook(() => useLoggerApi(), { wrapper: createWrapper({ onError }) });
      act(() => {
        result.current.triggerError(result.current.getStackData());
      });
      expect(onError).toHaveBeenCalledTimes(1);
      const [firstCall] = onError.mock.calls as [[Stack]];
      expect(firstCall[0]).toHaveProperty('actions');
    });

    it('sets traceId when traceId prop is a string', () => {
      const { result } = renderHook(() => useLoggerApi(), {
        wrapper: ({ children }: PropsWithChildren) => <LoggerContainer traceId="my-trace">{children}</LoggerContainer>,
      });
      expect(result.current.getStackData().traceId).toBe('my-trace');
    });

    it('sets traceId when traceId prop is a number', () => {
      const { result } = renderHook(() => useLoggerApi(), {
        wrapper: ({ children }: PropsWithChildren) => <LoggerContainer traceId={42}>{children}</LoggerContainer>,
      });
      expect(result.current.getStackData().traceId).toBe(42);
    });

    it('stores env string in stack data', () => {
      const { result } = renderHook(() => useLoggerApi(), {
        wrapper: ({ children }: PropsWithChildren) => <LoggerContainer env="production">{children}</LoggerContainer>,
      });
      expect(result.current.getStackData().env).toBe('production');
    });

    it('defaults env to empty string when not provided', () => {
      const { result } = renderHook(() => useLoggerApi(), { wrapper: createWrapper() });
      expect(result.current.getStackData().env).toBe('');
    });

    it('calls onPrepareStack when getStackData is invoked', () => {
      const onPrepareStack = jest.fn((s: Stack) => s);
      const { result } = renderHook(() => useLoggerApi(), {
        wrapper: ({ children }: PropsWithChildren) => (
          <LoggerContainer onPrepareStack={onPrepareStack}>{children}</LoggerContainer>
        ),
      });
      result.current.getStackData();
      expect(onPrepareStack).toHaveBeenCalledTimes(1);
    });

    it('limits the stack size to the limit prop', () => {
      render(
        <LoggerContainer limit={2}>
          <div />
        </LoggerContainer>,
      );
      logger.log('a');
      logger.log('b');
      logger.log('c');
      expect(logger.getStackCollection().getData().length).toBeLessThanOrEqual(2);
    });

    it('renders BSOD after a window error event', () => {
      render(
        <LoggerContainer>
          <div />
        </LoggerContainer>,
      );
      fireWindowError();
      expect(screen.getByText('Actions:')).toBeInTheDocument();
    });

    it('calls onError when a window error event fires', () => {
      const onError = jest.fn();
      render(
        <LoggerContainer onError={onError}>
          <div />
        </LoggerContainer>,
      );
      fireWindowError('crash message', 42);
      expect(onError).toHaveBeenCalledTimes(1);
      const [[stackData]] = onError.mock.calls as [[Stack]];
      expect(stackData.actions.some((a) => a.level === LoggerLevels.critical)).toBe(true);
    });

    it('renders BSOD after an unhandledrejection event', () => {
      render(
        <LoggerContainer>
          <div />
        </LoggerContainer>,
      );
      fireUnhandledRejection(new Error('async fail'));
      expect(screen.getByText('Actions:')).toBeInTheDocument();
    });

    it('calls onError with a critical entry on unhandledrejection', () => {
      const onError = jest.fn();
      render(
        <LoggerContainer onError={onError}>
          <div />
        </LoggerContainer>,
      );
      fireUnhandledRejection(new Error('async fail'));
      expect(onError).toHaveBeenCalledTimes(1);
      const [[stackData]] = onError.mock.calls as [[Stack]];
      expect(stackData.actions.some((a) => a.level === LoggerLevels.critical)).toBe(true);
    });

    it('uses the rejection reason message as the critical entry message', () => {
      const onError = jest.fn();
      render(
        <LoggerContainer onError={onError}>
          <div />
        </LoggerContainer>,
      );
      fireUnhandledRejection(new Error('specific async error'));
      const [[stackData]] = onError.mock.calls as [[Stack]];
      const criticalEntry = stackData.actions.find((a) => a.level === LoggerLevels.critical)!;
      expect(criticalEntry.message).toBe('specific async error');
    });

    it('converts a non-Error rejection reason to an Error message', () => {
      const onError = jest.fn();
      render(
        <LoggerContainer onError={onError}>
          <div />
        </LoggerContainer>,
      );
      fireUnhandledRejection('plain string reason');
      const [[stackData]] = onError.mock.calls as [[Stack]];
      const criticalEntry = stackData.actions.find((a) => a.level === LoggerLevels.critical)!;
      expect(criticalEntry.message).toBe('plain string reason');
    });

    it('renders the built-in BSOD by default', () => {
      render(
        <LoggerContainer>
          <div />
        </LoggerContainer>,
      );
      fireWindowError();
      expect(screen.getByText('Actions:')).toBeInTheDocument();
    });

    it('renders a custom bsod component when one is passed', () => {
      const CustomBsod = ({ count }: BsodProps): ReactElement => <div data-testid="custom-bsod">count:{count}</div>;
      render(
        <LoggerContainer bsod={CustomBsod}>
          <div />
        </LoggerContainer>,
      );
      fireWindowError();
      expect(screen.getByTestId('custom-bsod')).toBeInTheDocument();
    });
  });
});
