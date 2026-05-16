import { fireEvent, render, screen } from '@testing-library/react';

import { LogEntry, LoggerLevels, Stack } from '../types';
import Bsod from './bsod';

const createStack = (actions: LogEntry[]): Stack => ({
  actions,
  env: '',
  traceId: undefined,
});

const entry = (level: LoggerLevels, message: string, ctx = ''): LogEntry => ({ ctx, level, message, payload: {} });

const criticalError = {
  line: 10,
  message: 'Something went wrong',
  stack: ['Error: Something went wrong', '  at foo (foo.js:1:1)'],
};

const criticalEntry = (ctx = ''): LogEntry => ({
  ctx,
  level: LoggerLevels.critical,
  message: criticalError.message,
  payload: criticalError,
});

describe('Bsod', () => {
  describe('negative cases', () => {
    it('does not show error header when last action is not critical', () => {
      render(<Bsod count={1} onClose={jest.fn()} stackData={createStack([entry(LoggerLevels.log, 'some message')])} />);
      expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    });

    it('does not show error header when actions array is empty', () => {
      render(<Bsod count={0} onClose={jest.fn()} stackData={createStack([])} />);
      expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    });

    it('does not render critical level label in the actions list', () => {
      render(<Bsod count={1} onClose={jest.fn()} stackData={createStack([criticalEntry()])} />);
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
      const stack = createStack([
        entry(LoggerLevels.log, 'app started'),
        entry(LoggerLevels.info, 'user loaded'),
        entry(LoggerLevels.warn, 'slow response'),
      ]);
      const { baseElement } = render(<Bsod count={3} onClose={jest.fn()} stackData={stack} />);
      expect(baseElement).toMatchSnapshot();
    });

    it('matches snapshot with critical as last action', () => {
      const stack = createStack([entry(LoggerLevels.log, 'before error'), criticalEntry()]);
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
        const stack = createStack([entry(LoggerLevels[level], `${level} message`)]);
        render(<Bsod count={1} onClose={jest.fn()} stackData={stack} />);
        expect(screen.getByText(`${level}: ${level} message`, { selector: 'strong' })).toBeInTheDocument();
      });
    });

    it('renders ctx prefix when ctx is non-empty', () => {
      const stack = createStack([entry(LoggerLevels.log, 'opened', 'SettingsPanel')]);
      render(<Bsod count={1} onClose={jest.fn()} stackData={stack} />);
      expect(screen.getByText(/\[SettingsPanel\]/, { selector: 'strong' })).toBeInTheDocument();
    });

    it('omits ctx prefix when ctx is empty', () => {
      const stack = createStack([entry(LoggerLevels.log, 'no-ctx')]);
      render(<Bsod count={1} onClose={jest.fn()} stackData={stack} />);
      expect(screen.queryByText(/\[/)).not.toBeInTheDocument();
    });

    it('shows error header with stack[0] when last action is critical', () => {
      render(<Bsod count={1} onClose={jest.fn()} stackData={createStack([criticalEntry()])} />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Error: Something went wrong');
    });

    it('shows error header with message when stack[0] is an empty string', () => {
      const error = { line: 1, message: 'fallback message', stack: [''] };
      render(
        <Bsod
          count={1}
          onClose={jest.fn()}
          stackData={createStack([{ ctx: '', level: LoggerLevels.critical, message: error.message, payload: error }])}
        />,
      );
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('fallback message');
    });

    it('excludes critical from the actions list but shows the error header', () => {
      const stack = createStack([entry(LoggerLevels.log, 'normal log'), criticalEntry()]);
      render(<Bsod count={2} onClose={jest.fn()} stackData={stack} />);
      expect(screen.getByText('log: normal log', { selector: 'strong' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.queryByText(/critical:/)).not.toBeInTheDocument();
    });

    it('renders actions in reverse order', () => {
      const stack = createStack([
        entry(LoggerLevels.log, 'first'),
        entry(LoggerLevels.info, 'second'),
        entry(LoggerLevels.warn, 'third'),
      ]);
      render(<Bsod count={3} onClose={jest.fn()} stackData={stack} />);
      const items = screen.getAllByRole('listitem');
      expect(items[0]).toHaveTextContent('warn: third');
      expect(items[1]).toHaveTextContent('info: second');
      expect(items[2]).toHaveTextContent('log: first');
    });
  });
});
