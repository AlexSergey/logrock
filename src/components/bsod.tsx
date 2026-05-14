import { ReactElement } from 'react';
import { createPortal } from 'react-dom';

import { isCritical } from '../helpers/error-helpers';
import { LoggerLevels, Stack } from '../types';

export interface BsodProps {
  count: number;
  onClose: () => void;
  stackData: Stack;
}

const Bsod = (props: BsodProps): ReactElement => {
  const { actions } = props.stackData;
  const lastAction = actions[actions.length - 1];
  const cError = lastAction && LoggerLevels.critical in lastAction ? lastAction[LoggerLevels.critical] : undefined;

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
        {typeof props.onClose === 'function' && (
          <button
            onClick={props.onClose}
            style={{
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
              WebkitAppearance: 'none',
              width: '30px',
              zIndex: 1000,
            }}
            type="button"
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
          {cError && Array.isArray(cError.stack) && (
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
              start={props.count || actions.length - 1}
              style={{
                fontSize: '13px',
                listStyle: 'list-item',
              }}
            >
              {((): ReactElement[] => {
                const listOfActions = actions
                  .filter((action) => {
                    if (action === null || typeof action !== 'object' || Array.isArray(action)) {
                      return false;
                    }

                    const type = Object.keys(action)[0];

                    if (!type) {
                      return false;
                    }

                    return !isCritical(type);
                  })
                  .map((action) => {
                    if (action === null || typeof action !== 'object' || Array.isArray(action)) {
                      return null;
                    }

                    const type = Object.keys(action)[0];

                    if (!type) {
                      return null;
                    }

                    const actionMessage = action[type as keyof typeof action] as string;

                    return {
                      actionMessage,
                      type,
                    };
                  })
                  .filter((x): x is { actionMessage: string; type: string } => x !== null)
                  .reverse();

                return listOfActions.map(
                  ({ actionMessage, type }, index): ReactElement => (
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

export default Bsod;
