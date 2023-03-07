<div align="center">
    <a href="http://www.natrube.net/logrock/index.html">
        <img src="http://www.natrube.net/logrock/LogRock.png" alt="This module can help you build error tracking & crash reporting system" />
    </a>
</div>
<div align="center">
    <a href="http://www.natrube.net/logrock/index.html">Demo</a>
</div>

**logrock** is a React component and logging system that allows you to record all actions before a critical error occurs so that this information can be analyzed later.


## Table of Contents

- [Articles](#articles)
- [Using](#using)
- [Properties](#properties)
- [Browser Compatibility](#browser-compatibility)
- [License](#license)

## Articles
- ENG: [Log Driven Development [Article]](https://www.rockpack.io/log-driven-development)
- RUS: [LogRock: Тестирование через логирование [Article]](https://habr.com/ru/post/453652/)

## Using

1. Installation:

```sh
# NPM
npm install logrock --save

# YARN
yarn add logrock
```

2. For the logger system to work correctly, we need to wrap our application in a *<LoggerContainer>* component

```jsx
import React, { useCallback, useContext } from 'react';
import logger, { LoggerContainer, useLoggerApi } from 'logrock';

const App = () => {
  const { getStackData, triggerError } = useLoggerApi();
  ...
}

export default function () {
  const loggerCtx = useContext(LoggerContext);
  const showMessage = useCallback((level, message, important) => {
    if (important) {
      alert(message);
    }
  });

  return <LoggerContainer
    sessionID={window.sessionID}
    limit={75} // Stack length limit. On overflow, the first element will be removed
    getCurrentDate={() => {
      // Critical error date
      return dayjs()
        .format('YYYY-MM-DD HH:mm:ss');
    }}
    stdout={showMessage} // Display some errors as a tooltip for users
    onError={stackData => {
      // Send a stack of actions before the error to the backend (or otherwise process it)
      sendToServer(stack);
    }}
    onPrepareStack={stack => {
      // Allows you to add additional information to the stack
      stack.language = window.navigator.language;
    }}>
    <App/>
  </LoggerContainer>
}
```

4. You need to add the logger to any of the methods you want to cover our logging system.

The **logrock** module comes with a logger that is linked to *<LoggerContainer />*

Suppose we have a component

```jsx
import React, { useState } from 'react';

export default function Toggle(props) {
  const [toggleState, setToggleState] = useState('off');

  function toggle() {
    setToggleState(toggleState === 'off' ? 'on' : 'off');
  }

  return <div className={`switch ${toggleState}`} onClick={toggle}/>;
}
```

To properly log it, we need to modify the toggle method

```jsx
import React, { useState } from 'react';
import logger from 'logrock';

export default function Toggle(props) {
  const [toggleState, setToggleState] = useState('off');

  function toggle() {
    let state = toggleState === 'off' ? 'on' : 'off';
    logger.info(`React.Toggle|Toggle component changed state ${state}`);
    setToggleState(state);
  }

  return <div className={`switch ${toggleState}`} onClick={toggle}/>;
}
```

We have added a logger in which the information is divided into 2 parts. React.Toggle shows us that this action happened at the level of React, the Toggle component, and then we have a verbal explanation of the action and the current state that came to this component.

If a critical error occurs in the system, we will have a **Bsod** with a detailed description of the user's actions. It will also be possible to send this stack to the error analysis system or ElasticSearch in order to quickly catch errors that occurred among our users.

<p align="right">
  <img alt="Bsod" src="https://www.rockpack.io/readme_assets/rockpack_logger_bsod.jpg" />
</p>

*- When logging applications, you need to put logs in the most confusing and complex parts of the code, so you will understand what happened at this stage.*

*- We can also use the “componentDidCatch” method, which was introduced in React 16, in case an error occurs.*

## Properties

- \<LoggerContainer /> properties:

| Prop | Type | Description |
| --- | --- | --- |
| active | Boolean[true] | Enable / disable logging. It is recommended to disable logging during the testing phase. |
| bsodActive | Boolean[true] | Enable / disable Bsod output. It is recommended to disable for Production  |
| sessionID | Number | If you need to associate logging with Backend calls - a single session for Frontend and Backend will allow you to do this |
| bsod | ReactElement[Component] | You can set your Bsod Component |
| limit | Number[25] | Stack length limit. On overflow, the first element will be removed |
| getCurrentDate | Function | Date format when an error occurred. Default - new Date().toLocaleString() |
| onError | Function | window.onbeforeunload callback. In this callback, you can handle the stack or send it to the Backend |
| onPrepareStack | Function | Allows you to add additional information to the stack before calling onError. For example, you can add the current localization of the application, the theme selected by the user, the name of the user who got the error, etc. |
| stdout | Function | This method allows you to display the log method for the user (which was called with the second parameter "true"). For example, calling logger.error ('Ups ...', true) in the stdout method would output alert (message); |

- logger methods:

The logger provided with **logrock** has methods:

```js
logger.log('log text here!');
logger.info('Some extra log information');
logger.warn('Warning! Warning!');
logger.debug('I\'m a debug message!');
logger.error('Ups...');
```

If we add *true* as the second parameter, the message passed to this log method will be passed to stdout *<LoggerContainer>*. This will display some useful messages for the user, for example, in tooltip or alert.

## Browser Compatibility

| Browser | Works? |
| :------ | :----- |
| Chrome  | Yes    |
| Firefox | Yes    |
| Safari  | Yes    |
| IE 11   | Yes    |


## License

The MIT License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
