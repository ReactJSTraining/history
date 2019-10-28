import expect from 'expect';
import { createLocation } from 'history';

describe('createLocation', () => {
  describe('with a full path', () => {
    describe('given as a string', () => {
      it('has the correct properties', () => {
        expect(createLocation('/the/path?the=query#the-hash')).toMatchObject({
          pathname: '/the/path',
          search: '?the=query',
          hash: '#the-hash'
        });
      });
    });

    describe('given as an object', () => {
      it('has the correct properties', () => {
        expect(
          createLocation({
            pathname: '/the/path',
            search: '?the=query',
            hash: '#the-hash'
          })
        ).toMatchObject({
          pathname: '/the/path',
          search: '?the=query',
          hash: '#the-hash'
        });
      });
    });
  });

  describe('with a relative path', () => {
    describe('given as a string', () => {
      it('has the correct properties', () => {
        expect(createLocation('the/path?the=query#the-hash')).toMatchObject({
          pathname: 'the/path',
          search: '?the=query',
          hash: '#the-hash'
        });
      });
    });

    describe('given as an object', () => {
      it('has the correct properties', () => {
        expect(
          createLocation({
            pathname: 'the/path',
            search: '?the=query',
            hash: '#the-hash'
          })
        ).toMatchObject({
          pathname: 'the/path',
          search: '?the=query',
          hash: '#the-hash'
        });
      });
    });
  });

  describe('with a path with no pathname', () => {
    describe('given as a string', () => {
      it('has the correct properties', () => {
        expect(createLocation('?the=query#the-hash')).toMatchObject({
          pathname: '/',
          search: '?the=query',
          hash: '#the-hash'
        });
      });
    });

    describe('given as an object', () => {
      it('has the correct properties', () => {
        expect(
          createLocation({ search: '?the=query', hash: '#the-hash' })
        ).toMatchObject({
          pathname: '/',
          search: '?the=query',
          hash: '#the-hash'
        });
      });
    });
  });

  describe('with a path with no search', () => {
    describe('given as a string', () => {
      it('has the correct properties', () => {
        expect(createLocation('/the/path#the-hash')).toMatchObject({
          pathname: '/the/path',
          search: '',
          hash: '#the-hash'
        });
      });
    });

    describe('given as an object', () => {
      it('has the correct properties', () => {
        expect(
          createLocation({ pathname: '/the/path', hash: '#the-hash' })
        ).toMatchObject({
          pathname: '/the/path',
          search: '',
          hash: '#the-hash'
        });
      });
    });
  });

  describe('with a path with no hash', () => {
    describe('given as a string', () => {
      it('has the correct properties', () => {
        expect(createLocation('/the/path?the=query')).toMatchObject({
          pathname: '/the/path',
          search: '?the=query',
          hash: ''
        });
      });
    });

    describe('given as an object', () => {
      it('has the correct properties', () => {
        expect(
          createLocation({ pathname: '/the/path', search: '?the=query' })
        ).toMatchObject({
          pathname: '/the/path',
          search: '?the=query',
          hash: ''
        });
      });
    });
  });

  describe('key', () => {
    it('has a key property if a key is provided', () => {
      const location = createLocation('/the/path', undefined, 'key');
      expect(Object.keys(location)).toContain('key');
    });

    it('has no key property if no key is provided', () => {
      const location = createLocation('/the/path');
      expect(Object.keys(location)).not.toContain('key');
    });
  });

  describe('search parameters', () => {
    describe('given as a string', () => {
      it("removes redundant '?' from search", () => {
        expect(createLocation('/the/path?')).toMatchObject({
          pathname: '/the/path',
          search: ''
        });

        expect(createLocation('/the/path?#the-hash')).toMatchObject({
          pathname: '/the/path',
          search: '',
          hash: '#the-hash'
        });
      });
    });

    describe('given as an object', () => {
      it("removes redundant '?' from search", () => {
        expect(
          createLocation({
            pathname: '/the/path',
            search: '?'
          })
        ).toMatchObject({
          pathname: '/the/path',
          search: ''
        });
      });

      it("prepends '?' to search if it's missed", () => {
        expect(
          createLocation({
            pathname: '/the/path',
            search: 'the=query'
          })
        ).toMatchObject({
          pathname: '/the/path',
          search: '?the=query'
        });
      });
    });
  });
});
