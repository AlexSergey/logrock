import { isFunction, isObject } from 'valid-types';

const consoleOutput = (trackLevel, msg = '', console) => {
    msg = isFunction(msg) ? msg() : msg;

    let styles = {
        info: ['background: green', 'color: white', 'font-weight: bold', 'display: block', 'text-align: center'].join(';'),
        warn: ['background: #e36149', 'color: white', 'font-weight: bold', 'display: block', 'text-align: center'].join(';'),
        error: ['background: #E30C17', 'color: white', 'font-weight: bold', 'display: block', 'text-align: center'].join(';')
    };

    let parts = msg.split('|');
    let module, message;
    if (parts.length > 1) {
        module = parts[0];
        message = parts[1];
    } else {
        message = parts[0];
    }
    if (isObject(message)) {
        message = JSON.stringify(message);
    }

    if (isFunction(message)) {
        message = message();
    }
    if (console && isFunction(console[trackLevel])) {
        if (module) {
            console[trackLevel](`%c ${module} : `, styles[trackLevel], message);
        } else {
            console[trackLevel](message);
        }
    }
};

export default consoleOutput;
