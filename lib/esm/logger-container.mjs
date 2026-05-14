import { c as _c } from "react/compiler-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import BsodComponent from "./components/bsod.mjs";
import { getStackData, onCriticalError } from "./helpers/stack.mjs";
import { getCurrentDate } from "./helpers/utils.mjs";
import { logger } from "./logger.mjs";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const LoggerContext = /*#__PURE__*/createContext(null);
const isBackend = () => typeof window === 'undefined';
export const useLoggerApi = () => {
  const $ = _c(3);
  const ctx = useContext(LoggerContext);
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
export default function LoggerContainer({
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
  const [bsodVisible, setBsodVisible] = useState(false);
  const hasCriticalError = useRef(false);
  const stack = useRef({
    actions: logger.getStackCollection().data,
    env: {},
    keyboardPressed: null,
    mousePressed: null,
    ...(typeof onPrepareStack === 'function' ? {
      onPrepareStack
    } : {}),
    session: {
      start: typeof getCurrentDateFn === 'function' ? getCurrentDateFn() : getCurrentDate()
    },
    sessionId: typeof sessionID === 'string' || typeof sessionID === 'number' ? sessionID : undefined
  });
  useEffect(() => {
    logger.setUp({
      active
    });
    logger.getStackCollection().setLimit(limit);
    if (typeof stdout === 'function') {
      logger.setUp({
        stdout
      });
    }
  }, [active, limit, stdout]);
  const buildProps = useCallback(() => ({
    ...(typeof getCurrentDateFn === 'function' ? {
      getCurrentDate: getCurrentDateFn
    } : {}),
    ...(typeof onPrepareStack === 'function' ? {
      onPrepareStack
    } : {})
  }), [getCurrentDateFn, onPrepareStack]);
  const getStackDataFn = useCallback(() => getStackData(stack.current, logger.getStackCollection(), buildProps()), [buildProps]);
  const handleError = useCallback(stackData => {
    if (typeof onErrorCallback === 'function') {
      onErrorCallback(stackData);
    }
  }, [onErrorCallback]);
  const closeBsod = useCallback(() => {
    setBsodVisible(false);
  }, []);
  useEffect(() => {
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
      const stackData_0 = onCriticalError(stack.current, logger.getStackCollection(), buildProps(), e_1.error, e_1.lineno);
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
  const contextValue = useMemo(() => ({
    getStackData: getStackDataFn,
    onError: handleError
  }), [getStackDataFn, handleError]);
  const Bsod = typeof BsodProp === 'function' ? BsodProp : BsodComponent;
  return /*#__PURE__*/_jsxs(LoggerContext.Provider, {
    value: contextValue,
    children: [children, bsodActive && bsodVisible && /*#__PURE__*/_jsx(Bsod, {
      count: logger.getCounter(),
      onClose: closeBsod,
      stackData: getStackDataFn()
    })]
  });
}