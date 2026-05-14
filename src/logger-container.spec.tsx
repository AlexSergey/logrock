import { act, render, renderHook, screen } from "@testing-library/react";
import { PropsWithChildren, ReactElement } from "react";

import { BsodProps } from "./bsod";
import { logger } from "./logger";
import LoggerContainer, { useLoggerApi } from "./logger-container";
import { Stack } from "./types";

interface WrapperProps {
  onError?: (s: Stack) => void;
  stdout?: (level: string, message: string, important?: boolean) => void;
}

const createWrapper =
  (props: WrapperProps = {}) =>
  ({ children }: PropsWithChildren): ReactElement => <LoggerContainer {...props}>{children}</LoggerContainer>;

const fireWindowError = (message = "test error", lineno = 1): void => {
  act(() => {
    window.dispatchEvent(new ErrorEvent("error", { error: new Error(message), lineno }));
  });
};

afterEach(() => {
  logger.setUp({ active: true });
});

describe("LoggerContainer", () => {
  describe("negative cases", () => {
    it("does not call stdout when logger is inactive", () => {
      const stdout = jest.fn();
      render(
        <LoggerContainer active={false} stdout={stdout}>
          <div />
        </LoggerContainer>,
      );
      logger.log("test");
      expect(stdout).not.toHaveBeenCalled();
    });

    it("does not render BSOD when bsodActive is false", () => {
      render(
        <LoggerContainer bsodActive={false}>
          <div />
        </LoggerContainer>,
      );
      fireWindowError();
      expect(screen.queryByText("Actions:")).not.toBeInTheDocument();
    });

    it("handles only the first window error — subsequent errors are ignored", () => {
      const onError = jest.fn();
      render(
        <LoggerContainer onError={onError}>
          <div />
        </LoggerContainer>,
      );
      fireWindowError("first");
      fireWindowError("second");
      expect(onError).toHaveBeenCalledTimes(1);
    });

    it("does not throw when triggerError is called without an onError prop", () => {
      const { result } = renderHook(() => useLoggerApi(), { wrapper: createWrapper() });
      expect(() => {
        act(() => {
          result.current.triggerError(result.current.getStackData());
        });
      }).not.toThrow();
    });

    it("throws when useLoggerApi is called outside LoggerContext", () => {
      const consoleSpy = jest.spyOn(console, "error").mockReturnValue(undefined);
      expect(() => renderHook(() => useLoggerApi())).toThrow();
      consoleSpy.mockRestore();
    });

    it("leaves sessionId undefined when sessionID prop is a boolean", () => {
      const { result } = renderHook(() => useLoggerApi(), {
        wrapper: ({ children }: PropsWithChildren) => <LoggerContainer sessionID={false}>{children}</LoggerContainer>,
      });
      expect(result.current.getStackData().sessionId).toBeUndefined();
    });

    it("does not attach event listeners when active is false", () => {
      const addSpy = jest.spyOn(document, "addEventListener");
      render(
        <LoggerContainer active={false}>
          <div />
        </LoggerContainer>,
      );
      expect(addSpy).not.toHaveBeenCalledWith("mousedown", expect.any(Function));
      addSpy.mockRestore();
    });
  });

  describe("positive cases", () => {
    (["log", "info", "debug", "warn", "error"] as const).forEach((method) => {
      it(`calls stdout with correct args on logger.${method}`, () => {
        const stdout = jest.fn();
        render(
          <LoggerContainer stdout={stdout}>
            <div />
          </LoggerContainer>,
        );
        logger[method](`test ${method} message`);
        expect(stdout).toHaveBeenCalledWith(method, `test ${method} message`, false);
      });
    });

    it("getStackData returns actions that were logged", () => {
      const { result } = renderHook(() => useLoggerApi(), { wrapper: createWrapper() });
      logger.log("unique-getstack-msg");
      expect(result.current.getStackData().actions).toContainEqual({ log: "unique-getstack-msg" });
    });

    it("triggerError invokes onError with an Stack", () => {
      const onError = jest.fn();
      const { result } = renderHook(() => useLoggerApi(), { wrapper: createWrapper({ onError }) });
      act(() => {
        result.current.triggerError(result.current.getStackData());
      });
      expect(onError).toHaveBeenCalledTimes(1);
      const [firstCall] = onError.mock.calls as [[Stack]];
      expect(firstCall[0]).toHaveProperty("actions");
    });

    it("sets sessionId when sessionID prop is a string", () => {
      const { result } = renderHook(() => useLoggerApi(), {
        wrapper: ({ children }: PropsWithChildren) => (
          <LoggerContainer sessionID="my-session">{children}</LoggerContainer>
        ),
      });
      expect(result.current.getStackData().sessionId).toBe("my-session");
    });

    it("sets sessionId when sessionID prop is a number", () => {
      const { result } = renderHook(() => useLoggerApi(), {
        wrapper: ({ children }: PropsWithChildren) => <LoggerContainer sessionID={42}>{children}</LoggerContainer>,
      });
      expect(result.current.getStackData().sessionId).toBe(42);
    });

    it("uses custom getCurrentDate for session.start", () => {
      const { result } = renderHook(() => useLoggerApi(), {
        wrapper: ({ children }: PropsWithChildren) => (
          <LoggerContainer getCurrentDate={() => "custom-start"}>{children}</LoggerContainer>
        ),
      });
      expect(result.current.getStackData().session.start).toBe("custom-start");
    });

    it("uses custom getCurrentDate for session.end", () => {
      const { result } = renderHook(() => useLoggerApi(), {
        wrapper: ({ children }: PropsWithChildren) => (
          <LoggerContainer getCurrentDate={() => "custom-end"}>{children}</LoggerContainer>
        ),
      });
      expect(result.current.getStackData().session.end).toBe("custom-end");
    });

    it("calls onPrepareStack when getStackData is invoked", () => {
      const onPrepareStack = jest.fn((s: Stack) => s);
      const { result } = renderHook(() => useLoggerApi(), {
        wrapper: ({ children }: PropsWithChildren) => (
          <LoggerContainer onPrepareStack={onPrepareStack}>{children}</LoggerContainer>
        ),
      });
      result.current.getStackData();
      expect(onPrepareStack).toHaveBeenCalledTimes(1);
    });

    it("limits the stack size to the limit prop", () => {
      render(
        <LoggerContainer limit={2}>
          <div />
        </LoggerContainer>,
      );
      logger.log("a");
      logger.log("b");
      logger.log("c");
      expect(logger.getStackCollection().getData().length).toBeLessThanOrEqual(2);
    });

    it("renders BSOD after a window error event", () => {
      render(
        <LoggerContainer>
          <div />
        </LoggerContainer>,
      );
      fireWindowError();
      expect(screen.getByText("Actions:")).toBeInTheDocument();
    });

    it("calls onError when a window error event fires", () => {
      const onError = jest.fn();
      render(
        <LoggerContainer onError={onError}>
          <div />
        </LoggerContainer>,
      );
      fireWindowError("crash message", 42);
      expect(onError).toHaveBeenCalledTimes(1);
      const [[stackData]] = onError.mock.calls as [[Stack]];
      expect(stackData.actions.some((a) => "critical" in a)).toBe(true);
    });

    it("uses the custom bsod component when the bsod prop is provided", () => {
      const CustomBsod = ({ count }: BsodProps): ReactElement => <div data-testid="custom-bsod">count:{count}</div>;
      render(
        <LoggerContainer bsod={CustomBsod}>
          <div />
        </LoggerContainer>,
      );
      fireWindowError();
      expect(screen.getByTestId("custom-bsod")).toBeInTheDocument();
    });

    it("records mousePressed in stack data on mousedown", () => {
      const { result } = renderHook(() => useLoggerApi(), { wrapper: createWrapper() });
      act(() => {
        document.dispatchEvent(new MouseEvent("mousedown", { button: 2 }));
      });
      expect(result.current.getStackData().mousePressed).toBe(2);
    });

    it("resets mousePressed to null after mouseup", () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useLoggerApi(), { wrapper: createWrapper() });
      act(() => {
        document.dispatchEvent(new MouseEvent("mousedown", { button: 1 }));
        document.dispatchEvent(new MouseEvent("mouseup"));
        jest.runAllTimers();
      });
      expect(result.current.getStackData().mousePressed).toBeNull();
      jest.useRealTimers();
    });

    it("records keyboardPressed in stack data on keydown", () => {
      const { result } = renderHook(() => useLoggerApi(), { wrapper: createWrapper() });
      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyA" }));
      });
      expect(result.current.getStackData().keyboardPressed).toBe("KeyA");
    });

    it("resets keyboardPressed to null after keyup", () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useLoggerApi(), { wrapper: createWrapper() });
      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { code: "ShiftLeft" }));
        document.dispatchEvent(new KeyboardEvent("keyup"));
        jest.runAllTimers();
      });
      expect(result.current.getStackData().keyboardPressed).toBeNull();
      jest.useRealTimers();
    });
  });
});
