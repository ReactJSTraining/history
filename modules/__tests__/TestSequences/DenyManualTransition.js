import expect from 'expect'
import execSteps from './execSteps'

export default (history, done) => {
  let unblock, hookWasCalled = false
  const steps = [
    (location) => {
      expect(location).toMatch({
        pathname: '/'
      })

      unblock = history.block((nextLocation) => {
        expect(nextLocation).toMatch({
          pathname: '/something-new'
        })
        expect(window.location.hash).toBe('#/something-new')
        hookWasCalled = true

        return 'Are you sure?'
      })

      window.location.hash = '#/something-new'
    },
    (location) => {
      expect(location).toMatch({
        pathname: '/',
      })

      expect(hookWasCalled).toBe(true)

      unblock()
    }
  ]

  execSteps(steps, history, done)
}
