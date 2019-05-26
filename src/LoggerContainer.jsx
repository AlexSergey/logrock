import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isString, isNumber, isFunction } from 'valid-types';
import BSOD from './BSOD';
import { stack, stackCollection, getStackData, onCriticalError } from './stack';
import { getCurrentDate } from './utils';
import { setUp, logger, getCounter } from './logger';

class LoggerContainer extends Component {
    static childContextTypes = {
        logger: PropTypes.object
    };

    constructor(props) {
        super(props);
        const LIMIT = isNumber(this.props.limit) ? this.props.limit : 25;

        if (isNumber(Error.stackTraceLimit)) {
            Error.stackTraceLimit = LIMIT;
        }

        setUp(props);

        stackCollection.setLimit(LIMIT);

        this.__hasCriticalError = false;

        stack.session.start = isFunction(this.props.getCurrentDate) ? this.props.getCurrentDate() : getCurrentDate();

        if (isString(this.props.sessionID) || isNumber(this.props.sessionID)) {
            stack.sessionId = this.props.sessionID;
        }

        this.state = {
            bsod: false
        };

        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
        this._onMouseDown = this._onMouseDown.bind(this);

        document.addEventListener('mousedown', this._onMouseDown);
        document.addEventListener('mouseup', this._onMouseUp);
        document.addEventListener('keydown', this._onKeyDown);
        document.addEventListener('keyup', this._onKeyUp);
    }

    unbindActions() {
        document.removeEventListener('keydown', this._onKeyDown);
        document.removeEventListener('keyup', this._onKeyUp);
        document.removeEventListener('mousedown', this._onMouseDown);
        document.removeEventListener('mouseup', this._onMouseUp);
    }

    getChildContext() {
        return {
            logger: {
                getStackData: this.getStackData,
                onError: this.onError
            }
        };
    }

    componentWillUnmount() {
        this.unbindActions();
    }

    _onMouseDown(e) {
        stack.mousePressed = e && e.button;
    }

    _onKeyDown(e) {
        stack.keyboardPressed = e && e.keyCode;
    }

    _onKeyUp(e) {
        setTimeout(() => {
            stack.keyboardPressed = null;
        });
    }

    _onMouseUp(e) {
        setTimeout(() => {
            stack.mousePressed = null;
        });
    }

    getStackData = () => {
        return getStackData(this.props);
    };

    onError = stackData => {
        if (isFunction(this.props.onError)) {
            this.props.onError(stackData)
        }
    };

    closeBsod = () => {
        this.setState({
            bsod: false
        });
    };

    componentDidMount() {
        if (this.props.active) {
            window.onerror = (errorMsg, url, lineNumber, lineCount, trace) => {
                this.unbindActions();
                if (!this.__hasCriticalError) {
                    if (this.props.console && isFunction(this.props.console.error)) {
                        this.props.console.error('Critical error!');
                    }

                    this.__hasCriticalError = true;

                    let stackData = onCriticalError(trace, lineNumber, this.props);

                    this.onError(stackData);

                    if (this.props.console && isFunction(this.props.console.log)) {
                        this.props.console.log(stackData);
                    }

                    this.setState({
                        bsod: true
                    })
                }
            };
        }
    }
    render() {
        let Bsod = this.props.bsod;
        return <>
            {this.props.children}
            {this.props.bsodActive && this.state.bsod && <Bsod
                count={getCounter()}
                onClose={this.closeBsod}
                stackData={this.getStackData()}
            />}
        </>;
    }
}

LoggerContainer.propTypes = {
    active: PropTypes.bool,
    bsodActive: PropTypes.bool,
    sessionID: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.string,
        PropTypes.number
    ]),
    bsod: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.func
    ]),
    limit: PropTypes.number,
    getCurrentDate: PropTypes.func,
    onError: PropTypes.func,
    onPrepareStack: PropTypes.func,
    stdout: PropTypes.func,
    console: PropTypes.object
};

LoggerContainer.defaultProps = {
    active: true,
    bsodActive: true,
    bsod: BSOD,
    sessionID: false,
    limit: 25,
    getCurrentDate: getCurrentDate,
    console: console
};

export default LoggerContainer;