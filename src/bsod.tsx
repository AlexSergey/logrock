// eslint-disable-next-line import/no-extraneous-dependencies
import { createPortal } from 'react-dom';
import { isArray, isObject, isFunction } from 'valid-types';

import { isCritical, getCritical } from './error-helpers';
import { IStack } from './types';

export interface IBSOD {
  count: number;
  onClose: () => void;
  stackData: IStack;
}

const Bsod = (props: IBSOD): JSX.Element => {
  const { actions } = props.stackData;
  const cError = actions[actions.length - 1] ? actions[actions.length - 1][getCritical()] : {};

  return createPortal(
    <div
      style={{
        background: '#00a',
        color: '#b3b3b3',
        fontFamily: 'courier',
        fontSize: '14px',
        height: '100%',
        left: 0,
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 10000,
      }}
    >
      <div
        style={{
          height: '100%',
          position: 'relative',
          width: '100%',
        }}
      >
        {isFunction(props.onClose) && (
          <button
            type="button"
            onClick={props.onClose}
            style={{
              WebkitAppearance: 'none',
              background: '#eee',
              border: 0,
              cursor: 'pointer',
              fontSize: '24px',
              height: '30px',
              lineHeight: '25px',
              position: 'absolute',
              right: '25px',
              textAlign: 'center',
              top: '25px',
              width: '30px',
              zIndex: 1000,
            }}
          >
            X
          </button>
        )}
        {cError && (
          <h2
            style={{
              background: '#b3b3b3',
              color: '#00a',
              display: 'inline-block',
              fontFamily: 'courier',
              fontSize: '18px',
              fontWeight: 'bold',
              margin: '0 auto',
              padding: '0.25em 0.5em',
            }}
          >
            {cError.stack[0] || cError.message || ''}
          </h2>
        )}
        <div
          style={{
            fontSize: '1rem',
            margin: '2em',
            textAlign: 'left',
          }}
        >
          {cError && isArray(cError.stack) && (
            <pre
              style={{
                background: 'none',
                border: 0,
                color: 'rgb(179, 179, 179)',
                font: '10px/13px Lucida Console, Monaco, monospace',
                margin: '0 0 10px',
              }}
            >
              ${cError.stack.join('\n')}
            </pre>
          )}
          <h4>Actions:</h4>
          {actions.length > 0 ? (
            <ol
              reversed
              style={{
                fontSize: '13px',
                listStyle: 'list-item',
              }}
              start={props.count || actions.length - 1}
            >
              {((): JSX.Element[] => {
                const listOfActions = actions
                  .filter((action) => {
                    if (!isObject(action)) {
                      return false;
                    }

                    const type = Object.keys(action)[0];

                    if (!type) {
                      return false;
                    }

                    return !isCritical(type);
                  })
                  .map((action) => {
                    if (!isObject(action)) {
                      return false;
                    }

                    const type = Object.keys(action)[0];

                    if (!type) {
                      return false;
                    }

                    const actionMessage = action[type];

                    return {
                      actionMessage,
                      type,
                    };
                  })
                  .filter(Boolean)
                  .reverse();

                return listOfActions.map(
                  ({ actionMessage, type }: { actionMessage: string; type: string }, index): JSX.Element => (
                    <li key={index}>
                      <p>
                        <strong>
                          {type}: {actionMessage}
                        </strong>
                      </p>
                    </li>
                  ),
                );
              })()}
            </ol>
          ) : (
            <div>Nothing actions</div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

// eslint-disable-next-line import/no-default-export
export default Bsod;
