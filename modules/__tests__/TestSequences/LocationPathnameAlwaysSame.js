import expect from 'expect';

import execSteps from './execSteps.js';

export default function(history, done) {
  const steps = [
    () => {
      // encoded string
      const pathname = '/%E6%AD%B4%E5%8F%B2';
      history.replace(pathname);
    },
    location => {
      expect(location).toMatchObject({
        pathname: '/%E6%AD%B4%E5%8F%B2'
      });
      // encoded object
      const pathname = '/%E6%AD%B4%E5%8F%B2';
      history.replace({ pathname });
    },
    location => {
      expect(location).toMatchObject({
        pathname: '/%E6%AD%B4%E5%8F%B2'
      });
      // unencoded string
      const pathname = '/歴史';
      history.replace(pathname);
    },
    location => {
      expect(location).toMatchObject({
        pathname: '/歴史'
      });
      // unencoded object
      const pathname = '/歴史';
      history.replace({ pathname });
    },
    location => {
      expect(location).toMatchObject({
        pathname: '/歴史'
      });
    }
  ];

  execSteps(steps, history, done);
}
