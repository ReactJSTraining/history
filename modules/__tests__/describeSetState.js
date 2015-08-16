import expect from 'expect';
import { POP } from '../Actions';
import execSteps from './execSteps';

function describeSetState(createHistory) {
  describe('setState', function () {
    var history, unlisten;
    beforeEach(function () {
      history = createHistory();
    });

    afterEach(function () {
      if (unlisten)
        unlisten();
    });

    it('calls change listeners with the new location', function (done) {
      var steps = [
        function (location) {
          expect(location.pathname).toEqual('/');
          expect(location.search).toEqual('');
          expect(location.state).toEqual(null);
          expect(location.action).toEqual(POP);
          expect(location.current).toEqual(0);

          history.setState({ the: 'state' });
        },
        function (location) {
          expect(location.pathname).toEqual('/');
          expect(location.search).toEqual('');
          expect(location.state).toEqual({ the: 'state' });
          expect(location.action).toEqual(POP);
          expect(location.current).toEqual(0);
        }
      ];

      unlisten = history.listen(execSteps(steps, done));
    });
  });
}

export default describeSetState;
