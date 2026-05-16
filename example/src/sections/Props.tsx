import Code from '../components/Code';

function LoggerContainerProps() {
  return (
    <>
      <p style={{ fontSize: '17px' }}>
        <strong>{'<LoggerContainer />'}</strong> props:
      </p>
      <table className="table">
        <tbody>
          <tr>
            <th>active</th>
            <td>Boolean[true]</td>
            <td>Turn on/off logger system. You can turn it off in the test environment.</td>
          </tr>
          <tr>
            <th>bsodActive</th>
            <td>Boolean[true]</td>
            <td>Show BSOD when an error occurs in your system. I recommend you to turn it off in production.</td>
          </tr>
          <tr>
            <th>sessionID</th>
            <td>Number</td>
            <td>
              If you want to connect your session with backend actions you can generate SessionID and add it to all your
              requests.
            </td>
          </tr>
          <tr>
            <th>bsod</th>
            <td>Component</td>
            <td>Default Blue Screen Of Death component. You can change it to another.</td>
          </tr>
          <tr>
            <th>limit</th>
            <td>Number[25]</td>
            <td>Limit for actions that user made.</td>
          </tr>
          <tr>
            <th>getCurrentDate</th>
            <td>Function</td>
            <td>Format date function. By default - new Date().toLocaleString()</td>
          </tr>
          <tr>
            <th>onError</th>
            <td>Function</td>
            <td>
              window.onerror callback. If an error happens it will call with all stack data. You can send it to
              ElasticSearch or Backend or save it to file for analyzing and understanding user&apos;s actions.
            </td>
          </tr>
          <tr>
            <th>onPrepareStack</th>
            <td>Function</td>
            <td>
              This middleware will be called before you get stack in onError callback. In this callback, you can merge
              any extra data with your stack. For example, you can merge actual information about localization, theme,
              something settings etc.
            </td>
          </tr>
          <tr>
            <th>stdout</th>
            <td>Function</td>
            <td>
              <p>
                Called on every logger invocation. <code>ctx</code> is the component or module name passed as the second
                argument to the logger method. Set <code>important</code> to <code>true</code> to surface the message to
                the user via a toast or alert.
              </p>
              <p>Signature: <code>(level, message, ctx, important)</code></p>
              <p>For example:</p>
              <Code height="auto" width="100%" value={`logger.log('Settings panel opened', 'SettingsPanel', true);`} />
              <p>stdout handler:</p>
              <Code
                height="auto"
                width="100%"
                value={`<LoggerContainer
    stdout={(level, message, ctx, important) => {
        const label = ctx ? \`[\${ctx}] \${message}\` : message;
        console[level](label);

        if (important) {
            alert(label);
        }
    }}>
        <App />
</LoggerContainer>`}
              />
              See the code in{' '}
              <a
                href="https://github.com/AlexSergey/logrock/blob/master/example/src/Examples/index.jsx"
                target="_blank"
                rel="noreferrer"
              >
                provided example
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

function LoggerMethods() {
  return (
    <>
      <p style={{ fontSize: '17px' }}>
        <strong>logger</strong> methods:
      </p>
      <p>This is a simple logger. That related to LoggerContainer and it builds your stack.</p>
      <p>Each of logger calls and adds the new action to our stack.</p>
      <Code
        height="auto"
        width="100%"
        value={`logger.log("log text here!");
logger.info("Some extra log information");
logger.warn("Warning! Warning!");
logger.debug("I'm a debug message!");
logger.error("Ups...");`}
      />
      <p>
        Pass a component or module name as the second argument (<code>ctx</code>) to tag every entry with its source:
      </p>
      <Code
        height="auto"
        width="100%"
        value={`logger.log("User opened settings", "SettingsPanel");
logger.info("Feature flag enabled", "FeatureFlags");
logger.warn("Slow response detected", "ApiClient");
logger.error("Request failed", "ApiClient");`}
      />
      <p>
        Pass <code>true</code> as the third argument to forward the message to the <code>stdout</code> callback. Use
        this to surface important events to the user via a toast or alert.
      </p>
      <Code
        height="auto"
        width="100%"
        value={`logger.error("Session expired. Please log in again.", "Auth", true);`}
      />
      <p>Each entry in the stack is a flat object:</p>
      <Code
        height="auto"
        width="100%"
        value={`// interface LogEntry {
//   level: LoggerLevels;
//   ctx: string;
//   message: string;
//   payload: Record<string, unknown>;
// }

{ level: "log",   ctx: "SettingsPanel", message: "User opened settings", payload: {} }
{ level: "error", ctx: "ApiClient",     message: "Request failed",        payload: {} }
{
  level: "critical", ctx: "",
  message: "Unhandled error",
  payload: { line: 42, stack: ["Error: Unhandled error", "  at ..."] }
}`}
      />
    </>
  );
}

export default function Props() {
  return (
    <>
      <h3>Props</h3>
      <LoggerContainerProps />
      <LoggerMethods />
    </>
  );
}
