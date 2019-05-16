import React from 'react';
import { createPortal } from 'react-dom';
import { CRITICAL } from './types';
import { isArray, isObject, isFunction } from 'valid-types';

const BSOD = props => {
    const actions = props.stackData.actions;
    let cError = actions[actions.length - 1][CRITICAL];

    return createPortal(
        <div style={{
            width: '100%',
            height: '100%',
            position: 'fixed',
            zIndex: '10000',
            background: '#00a',
            color: '#b3b3b3',
            fontSize: '24px',
            fontFamily: 'courier',
            top: 0,
            left: 0
        }}>
            <div style={{
                width: '100%',
                height: '100%',
                position: 'relative'
            }}>
                {isFunction(props.onClose) && <button onClick={props.onClose} style={{
                    border: 0,
                    background: '#eee',
                    cursor: 'pointer',
                    width: '30px',
                    height: '30px',
                    textAlign: 'center',
                    WebkitAppearance: 'none',
                    position: 'absolute',
                    top: '25px',
                    right: '25px',
                    fontSize: '24px',
                    lineHeight: '25px',
                    zIndex: '1000'
                }}>
                    X
                </button>}
                {cError && <h2 style={{
                    display: 'inline-block',
                    padding: '0.25em 0.5em',
                    margin: '0 auto',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    background: '#b3b3b3',
                    color: '#00a'
                }}>{cError.message}</h2>}
                <div style={{
                    fontSize: '1rem',
                    textAlign: 'left',
                    margin: '2em'
                }}>
                    {cError && isArray(cError.stack) && <pre>${cError.stack.join('\n')}</pre>}
                    <h4>Actions:</h4>
                    {
                        actions.length > 0 ?
                            <ul style={{
                                listStyle: 'list-item',
                                fontSize: '13px'
                            }}>
                                {actions
                                    .filter(action => {
                                        if (!isObject(action)) {
                                            return false;
                                        }

                                        let type = Object.keys(action)[0];

                                        if (!type) {
                                            return false;
                                        }

                                        return type !== CRITICAL;
                                    })
                                    .map(action => {
                                        if (!isObject(action)) {
                                            return false;
                                        }

                                        let type = Object.keys(action)[0];

                                        if (!type) {
                                            return false;
                                        }

                                        let actionMessage = action[type];

                                        return <li>
                                            <p><strong>{type}: {actionMessage}</strong></p>
                                        </li>;
                                    })
                                    .filter(Boolean)
                                }
                            </ul> :
                            <div>Nothing actions</div>
                    }
                </div>
            </div>
        </div>,
        document.body
    );
};

export default BSOD;
