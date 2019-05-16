import logger from 'js-logger';
import { getType } from './types';
import { isFunction, isObject, isString } from 'valid-types';
import consoleOutput from './console.output';
import { mixParams } from './errorHelpers';
import { stackCollection } from './stack';
/**
 * Types:
 * log
 * info
 * warn
 * error
 * debug
 * */
logger.useDefaults();

function setUp(props) {
    logger.setHandler((messages, context) => {
        if (!logger.ignoreLogging) {
            if (props.active) {
                let msg = messages[0];
                let level = context.level.name.toLowerCase();
                let notificationShow = messages[1];

                let trackLevel = getType(level, false);

                if (notificationShow && isFunction(props.stdout)) {
                    props.stdout(getType(level, true), msg);
                }

                consoleOutput(trackLevel, msg, props.console);

                let stackData;

                if (isString(msg)) {
                    let temp = {};
                    temp[trackLevel] = msg;
                    stackData = temp;
                } else if (isObject(msg)) {
                    stackData = msg;
                }

                if (stackData) {
                    stackCollection.add(mixParams(stackData, true));
                }
            }
        }
    });
}

export { setUp, logger };