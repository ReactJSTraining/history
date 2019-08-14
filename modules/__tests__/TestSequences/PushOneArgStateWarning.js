import expect from 'expect';

import execSteps from './execSteps';

export default function(history, done) {
  const steps = [
    location => {
      expect(location).toMatchObject({
        pathname: '/'
      });

      history.push({ pathname: '/home', state: { the: 'state' } });
    },
    (location, action) => {
      expect(action).toBe('PUSH');
      expect(location).toMatchObject({
        pathname: '/home',
        hash: '',
        search: '',
        state: undefined
      });

      // We should see a warning message.
      expect(warningMessage).toMatch(
        'Hash history cannot push state; it is ignored'
      );
    }
  ];

  let consoleWarn = console.warn; // eslint-disable-line no-console
  let warningMessage;

  // eslint-disable-next-line no-console
  console.warn = message => {
    warningMessage = message;
  };

  execSteps(steps, history, (...args) => {
    console.warn = consoleWarn; // eslint-disable-line no-console
    done(...args);
  });
}
