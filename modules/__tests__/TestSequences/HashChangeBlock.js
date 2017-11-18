import expect from 'expect'
import execSteps from './execSteps'

export default (history, done) => {
  const steps = [
    (location) => {
      expect(location).toMatch({
        pathname: '/'
      })

      const unblock = history.block(nextLocation => {
        expect(nextLocation).toMatch({
          pathname: '/home'
        })

        return 'Are you sure?'
      })
      
      // Manually change hash    
      window.location.hash = "#/home"

      expect(history.location).toMatch({
        pathname: '/'
      })

      expect(window.location.hash).toEqual("#/")

      unblock()
    }
  ]

  execSteps(steps, history, done)
}
