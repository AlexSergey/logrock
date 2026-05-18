import { useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import logger, { LoggerContainer, type Stack, useLoggerApi } from '../../../src';
import 'react-toastify/dist/ReactToastify.css';

const sessionID = `sessionid-${Math.random().toString(36).substring(3, 9)}`;

type LogLevel = 'log' | 'info' | 'error' | 'debug' | 'warn';

const toastByLevel: Record<LogLevel, ((msg: string) => void) | undefined> = {
  log: toast.success,
  info: toast.success,
  error: toast.error,
  debug: toast.warning,
  warn: toast.warning,
};

function LoggerDemo() {
  const { getStackData, triggerError } = useLoggerApi();

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
      />
      <div>
        <table className="table text-center">
          <tbody>
            <tr>
              <td>
                <p style={{ fontSize: '16px' }}>
                  <strong>logger.log</strong>
                </p>
                <button className="btn btn-primary mb-2" onClick={() => logger.log('test log', 'Examples', true)}>
                  log
                </button>
              </td>
              <td>
                <p style={{ fontSize: '16px' }}>
                  <strong>logger.info</strong>
                </p>
                <button className="btn btn-info mb-2" onClick={() => logger.info('test info', 'Examples', true)}>
                  info
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <p style={{ fontSize: '16px' }}>
                  <strong>logger.debug</strong>
                </p>
                <button className="btn btn-secondary mb-2" onClick={() => logger.debug('test debug', 'Examples', true)}>
                  debug
                </button>
              </td>
              <td>
                <p style={{ fontSize: '16px' }}>
                  <strong>logger.warn</strong>
                </p>
                <button className="btn btn-warning mb-2" onClick={() => logger.warn('test warn', 'Examples', true)}>
                  warn
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <p style={{ fontSize: '16px' }}>
                  <strong>logger.error</strong>
                </p>
                <button className="btn btn-danger mb-2" onClick={() => logger.error('test error', 'Examples', true)}>
                  error
                </button>
              </td>
              <th>
                <h3>onError callback</h3>
                <button
                  className="btn btn-primary mb-2"
                  onClick={() => {
                    throw new Error('FATAL ERROR');
                  }}
                >
                  FATAL ERROR!
                </button>
                <br />
                <button
                  className="btn btn-warning mb-2"
                  onClick={() => {
                    Promise.reject(new Error('Unhandled Promise Rejection'));
                  }}
                >
                  Unhandled Rejection
                </button>
              </th>
            </tr>
          </tbody>
        </table>
        <button className="btn btn-primary mb-2" onClick={() => triggerError(getStackData())}>
          Show logger stack
        </button>
      </div>
    </>
  );
}

export default function Examples() {
  const showMessage = useCallback((level: string, message: string, ctx: string, important: boolean) => {
    const lvl = level as LogLevel & 'critical';
    const cleanLevel = lvl === 'critical' ? 'error' : lvl;
    console[cleanLevel](ctx ? `[${ctx}] ${message}` : message);

    if (important) {
      toastByLevel[cleanLevel]?.(ctx ? `[${ctx}] ${message}` : message);
    }
  }, []);

  return (
    <>
      <h3 id="example">Example</h3>
      <p style={{ fontSize: '17px' }}>
        This is a simple example with using all of callbacks and settings. See code{' '}
        <a
          href="https://github.com/AlexSergey/logrock/blob/master/example/src/Examples/index.jsx"
          target="_blank"
          rel="noreferrer"
        >
          here
        </a>
        !
      </p>
      <LoggerContainer
        traceId={sessionID}
        env={typeof window !== 'undefined' ? window.location.origin : ''}
        limit={75}
        showBsod={true}
        stdout={showMessage}
        onError={(stackData) => {
          console.log(stackData);
        }}
        onPrepareStack={(stack) => {
          // metadata already captures browser, os, viewport, screen, language, mobile, timezone, url
          // use onPrepareStack only for business-specific context
          const extended = stack as Stack & { sessionId: string };
          extended.sessionId = sessionID;
          return stack;
        }}
      >
        <LoggerDemo />
      </LoggerContainer>
    </>
  );
}
