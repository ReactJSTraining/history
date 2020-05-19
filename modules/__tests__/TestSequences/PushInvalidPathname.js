import expect from 'expect';

import execSteps from './execSteps';

export default function(history, done) {
  const steps = [
    () => {
      expect(() => {
        history.push('/hello%');
      }).toThrow(
        'Pathname "/hello%" has segment(s) that cannot be decoded. This is likely caused by an invalid percent-encoding.'
      );
    }
  ];

  execSteps(steps, history, done);
}
