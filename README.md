<div align="center">
    <a href="http://www.natrube.net/logrock/index.html">
        <img src="http://www.natrube.net/logrock/LogRock.png" alt="logrock — error tracking & crash reporting for React" />
    </a>
</div>
<div align="center">
    <a href="http://www.natrube.net/logrock/index.html">Demo</a>
</div>

**logrock** is a React logging library that captures every user action before a critical error occurs and surfaces it as a structured stack — ready to display in a built-in BSOD overlay or send to your error tracking backend.

## Table of Contents

- [Articles](#articles)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Logging](#logging)
- [Automatic Error Capture](#automatic-error-capture)
- [Reading the Stack](#reading-the-stack)
- [Custom BSOD](#custom-bsod)
- [Properties](#properties)
- [Browser Compatibility](#browser-compatibility)
- [License](#license)

## Articles

- ENG: [Log Driven Development](https://www.rockpack.io/log-driven-development)
- RUS: [LogRock: Тестирование через логирование](https://habr.com/ru/post/453652/)

## Installation

```sh
# npm
npm install logrock

# yarn
yarn add logrock
```

## Quick Start

Wrap your application in `<LoggerContainer>`. All logging and error capture happens inside this boundary.

```tsx
import logger, { LoggerContainer } from 'logrock';

function App() {
  return <main>...</main>;
}

export default function Root() {
  return (
    <LoggerContainer
      traceId={window.sessionID}
      env="development"
      limit={75}
      stdout={(level, message, ctx, important) => {
        if (important) alert(`[${ctx}] ${message}`);
      }}
      onError={(stackData) => {
        // send the action stack to your backend or error tracker
        sendToServer(stackData);
      }}
      onPrepareStack={(stack) => ({
        ...stack,
        // attach any custom context before the stack is sent
        // stack.metadata already contains browser, browserVersion and os
        extraData: 'some-data'
      })}
    >
      <App />
    </LoggerContainer>
  );
}
```

## Logging

Import the `logger` singleton and call its methods anywhere in your application:

```ts
import logger from 'logrock';

logger.log('User opened settings panel');
logger.info('Feature flag "dark-mode" is enabled');
logger.warn('Response time exceeded 2 s');
logger.debug('Computed layout: 1024×768');
logger.error('Failed to parse server response');
```

### Context (`ctx`)

Pass a component or module name as the second argument to tag the log entry with its origin. The `ctx` string is stored in the stack entry and forwarded to the `stdout` callback so you can filter or prefix log output by source:

```ts
logger.log('User opened settings panel', 'SettingsPanel');
logger.info('Feature flag enabled', 'FeatureFlags');
logger.warn('Response time exceeded 2 s', 'ApiClient');
logger.error('Failed to parse response', 'ApiClient');
```

Each log entry in the stack will be `{ level: 'log', ctx: 'SettingsPanel', message: 'User opened settings panel', payload: {} }`.

### Important flag

Pass `true` as the third argument to forward the message to the `stdout` prop of `<LoggerContainer>`. Use this for messages that should be visible to the user (e.g. a toast or alert):

```ts
logger.error('Your session has expired. Please log in again.', 'Auth', true);
```

### Example — logging component state

```tsx
import { useState } from 'react';
import logger from 'logrock';

export default function Toggle() {
  const [state, setState] = useState<'off' | 'on'>('off');

  function toggle() {
    const next = state === 'off' ? 'on' : 'off';
    logger.info(`Toggle changed state to ${next}`, 'Toggle');
    setState(next);
  }

  return <div className={`switch ${state}`} onClick={toggle} />;
}
```

## Automatic Error Capture

`<LoggerContainer>` automatically listens for two global error events:

| Event | Trigger |
| --- | --- |
| `window error` | Uncaught JavaScript exception (`throw new Error(...)`) |
| `window unhandledrejection` | Unhandled promise rejection (`Promise.reject(...)` without `.catch()`) |

When either event fires, `LoggerContainer`:
1. Records a `critical`-level entry (with `{ line, stack }` in `payload`) into the action stack.
2. Calls `onError` with the full stack snapshot.
3. Shows the BSOD overlay (unless `showBsod={false}`).

Only the first critical event per `<LoggerContainer>` mount is handled — subsequent errors are ignored while the overlay is visible.

---

When a critical error occurs the built-in BSOD overlay displays every recorded action — including each entry's `ctx` tag — so you can immediately see the sequence of events that led to the crash:

<p align="right">
  <img alt="BSOD overlay" src="https://www.rockpack.io/readme_assets/rockpack_logger_bsod.jpg" />
</p>

> Tip: place log calls around the most complex or error-prone parts of your code so the action trail is meaningful when you need it.

## Reading the Stack

Use the `useLoggerApi` hook inside any component that is a descendant of `<LoggerContainer>` to access the current stack or trigger an error manually:

```tsx
import { useLoggerApi } from 'logrock';

function DebugPanel() {
  const { getStackData, triggerError } = useLoggerApi();

  return (
    <button onClick={() => triggerError(getStackData())}>
      Simulate crash
    </button>
  );
}
```

| Return value | Type | Description |
| --- | --- | --- |
| `getStackData` | `() => Stack` | Returns a snapshot of the current action stack with session metadata |
| `triggerError` | `(stack: Stack) => void` | Invokes the `onError` callback manually with the provided stack |

## Custom BSOD

Replace the default overlay with your own component by passing it to the `bsodComponent` prop. Your component receives the same `BsodProps` as the built-in one:

```tsx
import { BsodProps, LoggerContainer } from 'logrock';

function MyErrorScreen({ count, stackData, onClose }: BsodProps) {
  return (
    <div className="error-screen">
      <h1>Oops — something went wrong</h1>
      <p>{count} actions recorded</p>
      <button onClick={onClose}>Dismiss</button>
    </div>
  );
}

<LoggerContainer bsodComponent={MyErrorScreen}>
  <App />
</LoggerContainer>
```

## Properties

### `<LoggerContainer>`

| Prop | Type | Default | Description                                                                                                                                                               |
| --- | --- | --- |---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enabled` | `boolean` | `true` | Enable or disable logging and the error listener. Disable during tests to keep them isolated.                                                                             |
| `bsodComponent` | `FunctionComponent<BsodProps>` | built-in | Pass a custom component to replace the default BSOD overlay. Omit to use the built-in one.                                                                               |
| `showBsod` | `boolean` | `true` | Show or hide the BSOD overlay without affecting `onError`. Set to `false` to suppress the overlay while still receiving error reports.                                   |
| `traceId` | `string \| number` | — | Identifier stored as `traceId` in the stack. Use it to correlate the stack with a backend request or session.                                                             |
| `env` | `string` | `''` | Environment label stored in the stack (e.g. `'production'`, `'development'`).                                                                                             |
| `limit` | `number` | `25` | Maximum number of actions kept in the stack. Oldest entries are dropped when the limit is exceeded.                                                                       |
| `onError` | `(stack: Stack) => void` | — | Called when a critical error is captured. Use this to send the stack to your backend or error tracker.                                                                    |
| `onPrepareStack` | `(stack: Stack) => Stack` | — | Transform the stack before it is passed to `onError`. Return the modified stack.                                                                                          |
| `stdout` | `(level: string, message: string, ctx: string, important: boolean) => void` | — | Called for every `logger.*` invocation. `ctx` is the component/module name passed to the logger method. When `important` is `true` the message was flagged by the caller. |

### `logger` methods

| Method | Description |
| --- | --- |
| `logger.log(msg, ctx?, important?)` | General-purpose log entry |
| `logger.info(msg, ctx?, important?)` | Informational entry |
| `logger.warn(msg, ctx?, important?)` | Warning entry |
| `logger.debug(msg, ctx?, important?)` | Debug entry |
| `logger.error(msg, ctx?, important?)` | Error entry |

`ctx` is an optional string that identifies the source component or module. It is stored in the stack entry and forwarded to `stdout`. When omitted it defaults to an empty string.

### `LogEntry` shape

Every entry in `stack.actions` is a flat object:

```ts
// LogEntry — one recorded action
interface LogEntry {
  level: LoggerLevels;              // 'log' | 'info' | 'warn' | 'debug' | 'error' | 'critical'
  ctx: string;                      // component/module name, empty string when omitted
  message: string;                  // human-readable log text
  payload: Record<string, unknown>; // {} for regular entries; { line, stack } for critical
}

// StackMetadata — browser environment captured at snapshot time
type StackMetadata = {
  browser: string;         // e.g. 'Chrome', 'Firefox', 'Safari', 'Edge'
  browserVersion: string;  // e.g. '120.0.6099.71'
  os: string;              // e.g. 'Windows 10.0', 'macOS 14.1', 'Android 13', 'iOS 17.0'
  viewport: string;        // inner window size, e.g. '1512x982'
  screen: string;          // physical screen size, e.g. '2560x1440'
  devicePixelRatio: number;// e.g. 2 for Retina displays
  language: string;        // e.g. 'en-US'
  timezone: string;        // e.g. 'Europe/Zagreb'
  mobile: boolean;         // true when touch device or mobile UA is detected
  url: string;             // window.location.pathname, e.g. '/checkout/payment'
  fullUrl: string;         // window.location.href, e.g. 'https://app.com/checkout/payment?id=123'
};

// Stack — the full snapshot sent to onError / returned by getStackData
interface Stack {
  actions: LogEntry[];                   // recorded log entries (capped at limit)
  env: string;                           // value passed via the env prop
  metadata: StackMetadata;              // browser/OS/device context collected at snapshot time
  timestamp: string;                    // ISO 8601 timestamp of when the snapshot was taken
  traceId: string | number | undefined; // value passed via the traceId prop
}
```

Examples of entries inside `stack.actions`:

```ts
{ level: 'log',   ctx: 'SettingsPanel', message: 'User opened settings', payload: {} }
{ level: 'error', ctx: 'ApiClient',     message: 'Request failed',        payload: {} }
{
  level: 'critical',
  ctx: '',
  message: 'Unhandled error message',
  payload: { line: 42, stack: ['Error: Unhandled error message', '  at ...'] }
}
```

## Browser Compatibility

| Browser | Works? |
| :------ | :----- |
| Chrome  | Yes    |
| Firefox | Yes    |
| Safari  | Yes    |

# The MIT License

[LICENSE](https://github.com/prod-forge/backend/blob/main/LICENSE.md)
