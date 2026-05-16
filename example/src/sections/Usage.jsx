import React from 'react';
import Code from '../components/Code';

const Approach = () => {
    return <>
        <h3>Usage</h3>
        <p><strong>1. Installation:</strong></p>
        <code>
            # NPM<br />
            npm install logrock --save<br />
            <br />
            # YARN<br />
            yarn add logrock<br />
        </code>
        <br/>
        <p><strong>2. ES6 and CommonJS builds are available with each distribution. For example:</strong></p>
        <Code height={'18px'} value={`import logger, { LoggerContainer, LoggerContext } from 'logrock'`} />
        <p><strong>3. You need to wrap your app with {`<LoggerContainer>`}</strong></p>
        <Code height={'auto'} width={'100%'} value={`import React, { useCallback } from 'react';
import { LoggerContainer } from 'logrock';

export default function Root() {
    const showMessage = useCallback((level, message, ctx, important) => {
        // ctx is the component/module name passed to the logger method
        const label = ctx ? \`[\${ctx}] \${message}\` : message;
        console[level](label);
        if (important) alert(label);
    }, []);

    return <LoggerContainer
           sessionID={window.sessionID}
           limit={75} // stack limit. After overflowing the first item will be removed
           getCurrentDate={() => {
                // You can replace the default date with another format
                return dayjs().format('YYYY-MM-DD HH:mm:ss');
           }}
           stdout={showMessage} // show logs for your users
           onError={stackData => {
               // Send stack to your backend, ElasticSearch, etc.
               sendToServer(stackData);
           }}
           onPrepareStack={stack => {
               // Middleware — add extra data before onError is called
               stack.language = window.navigator.language;
               return stack;
           }}>
               <App />
       </LoggerContainer>
}`} />
        <p><strong>4. Add the logger to any method you want to track. Use the second argument to tag entries with a component or module name.</strong></p>
        <p>For example, we have a Toggle component in React:</p>
        <Code height={'auto'} width={'100%'} value={`import React, { useState } from "react";

export default function Toggle(props) {
    const [toggleState, setToggleState] = useState("off");

    function toggle() {
        setToggleState(toggleState === "off" ? "on" : "off");
    }

    return <div className={\`switch \${toggleState}\`} onClick={toggle} />;
}`} />
        <p>Add logger calls with a ctx string so you can trace which component produced each entry:</p>
        <Code height={'auto'} width={'100%'} value={`import React, { useState } from "react";
import logger from "logrock";

export default function Toggle(props) {
    const [toggleState, setToggleState] = useState("off");

    function toggle() {
        const state = toggleState === "off" ? "on" : "off";
        logger.info(\`Toggle changed state to \${state}\`, "Toggle");
        setToggleState(state);
    }

    return <div className={\`switch \${toggleState}\`} onClick={toggle} />;
}`} />
        <p>The entry stored in the stack will look like:</p>
        <Code height={'auto'} width={'100%'} value={`{ level: "info", ctx: "Toggle", message: "Toggle changed state to on" }`} />
    </>;
};

export default Approach;
