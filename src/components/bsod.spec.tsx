import { fireEvent, render, screen } from '@testing-library/react';

import { CriticalError, LogEntry, Stack } from '../types';
import Bsod from './bsod';

const createStack = (actions: LogEntry[]): Stack => ({
  actions,
  env: {},
  keyboardPressed: null,
  mousePressed: null,
  session: { end: '2026-01-01', start: '2026-01-01' },
  sessionId: undefined,
});

const criticalError: CriticalError = {
  line: 10,
  message: 'Something went wrong',
  stack: ['Error: Something went wrong', '  at foo (foo.js:1:1)'],
};

describe('Bsod', () => {
  describe('negative cases', () => {
    it('does not show error header when last action is not critical', () => {
      render(<Bsod count={1} onClose={jest.fn()} stackData={createStack([{ log: 'some message' }])} />);
      expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    });

    it('does not show error header when actions array is empty', () => {
      render(<Bsod count={0} onClose={jest.fn()} stackData={createStack([])} />);
      expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    });

    it('does not render critical action type label in the actions list', () => {
      render(<Bsod count={1} onClose={jest.fn()} stackData={createStack([{ critical: criticalError }])} />);
      expect(screen.queryByText(/critical:/)).not.toBeInTheDocument();
    });

    it('shows "Nothing actions" when actions array is empty', () => {
      render(<Bsod count={0} onClose={jest.fn()} stackData={createStack([])} />);
      expect(screen.getByText('Nothing actions')).toBeInTheDocument();
    });
  });

  describe('positive cases', () => {
    it('matches snapshot with empty actions', () => {
      const { baseElement } = render(<Bsod count={0} onClose={jest.fn()} stackData={createStack([])} />);
      expect(baseElement).toMatchSnapshot();
    });

    it('matches snapshot with non-critical actions', () => {
      const stack = createStack([{ log: 'app started' }, { info: 'user loaded' }, { warn: 'slow response' }]);
      const { baseElement } = render(<Bsod count={3} onClose={jest.fn()} stackData={stack} />);
      expect(baseElement).toMatchSnapshot();
    });

    it('matches snapshot with critical as last action', () => {
      const stack = createStack([{ log: 'before error' }, { critical: criticalError }]);
      const { baseElement } = render(<Bsod count={2} onClose={jest.fn()} stackData={stack} />);
      expect(baseElement).toMatchSnapshot();
    });

    it('calls onClose when the close button is clicked', () => {
      const onClose = jest.fn();
      render(<Bsod count={0} onClose={onClose} stackData={createStack([])} />);
      fireEvent.click(screen.getByRole('button'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    (['log', 'info', 'debug', 'warn', 'error'] as const).forEach((level) => {
      it(`renders ${level} action in the actions list`, () => {
        const stack = createStack([{ [level]: `${level} message` } as LogEntry]);
        render(<Bsod count={1} onClose={jest.fn()} stackData={stack} />);
        expect(screen.getByText(`${level}: ${level} message`, { selector: 'strong' })).toBeInTheDocument();
      });
    });

    it('shows error header with stack[0] when last action is critical', () => {
      render(<Bsod count={1} onClose={jest.fn()} stackData={createStack([{ critical: criticalError }])} />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Error: Something went wrong');
    });

    it('shows error header with message when stack[0] is an empty string', () => {
      const error: CriticalError = { line: 1, message: 'fallback message', stack: [''] };
      render(<Bsod count={1} onClose={jest.fn()} stackData={createStack([{ critical: error }])} />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('fallback message');
    });

    it('excludes critical from the actions list but shows the error header', () => {
      const stack = createStack([{ log: 'normal log' }, { critical: criticalError }]);
      render(<Bsod count={2} onClose={jest.fn()} stackData={stack} />);
      expect(screen.getByText('log: normal log', { selector: 'strong' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.queryByText(/critical:/)).not.toBeInTheDocument();
    });

    it('renders actions in reverse order', () => {
      const stack = createStack([{ log: 'first' }, { info: 'second' }, { warn: 'third' }]);
      render(<Bsod count={3} onClose={jest.fn()} stackData={stack} />);
      const items = screen.getAllByRole('listitem');
      expect(items[0]).toHaveTextContent('warn: third');
      expect(items[1]).toHaveTextContent('info: second');
      expect(items[2]).toHaveTextContent('log: first');
    });
  });
});
