import { useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import dayjs from 'dayjs';
import platform from 'platform';
import isMobile from 'is-mobile';
import logger, { LoggerContainer, Stack, useLoggerApi } from '../../../src';
import 'react-toastify/dist/ReactToastify.css';

const { name, os, version } = platform;

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
    const lvl = level as LogLevel;
    console[lvl](ctx ? `[${ctx}] ${message}` : message);

    if (important) {
      toastByLevel[lvl]?.(ctx ? `[${ctx}] ${message}` : message);
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
        traceID={sessionID}
        env={typeof window !== 'undefined' ? window.location.origin : ''}
        limit={75}
        stdout={showMessage}
        onError={(stackData) => {
          console.log(stackData);
        }}
        onPrepareStack={(stack) => {
          const BROWSER = `${name ?? ''} ${version ?? ''}`;
          const OS = `${os?.family ?? ''} ${os?.architecture ?? ''}-bit`;

          const screen = window.screen
            ? {
                width: window.screen.width,
                height: window.screen.height,
                colorDepth: window.screen.colorDepth,
                pixelDepth: window.screen.pixelDepth,
                ...(window.screen.orientation ? { orientation: window.screen.orientation.type } : {}),
              }
            : {};

          const device = isMobile()
            ? { type: platform.product, description: platform.description, ua: platform.ua }
            : { type: 'pc', description: platform.description, ua: platform.ua };

          const extended = stack as Stack & {
            screen: Record<string, unknown>;
            device: Record<string, unknown>;
            browser: string;
            os: string;
          };

          extended.screen = screen;
          extended.device = device;
          extended.browser = BROWSER;
          extended.os = OS;

          return stack;
        }}
      >
        <LoggerDemo />
      </LoggerContainer>
    </>
  );
}
