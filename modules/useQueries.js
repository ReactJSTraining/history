import qs from 'qs';

function defaultStringifyQuery(query) {
  return qs.stringify(query, { arrayFormat: 'brackets' });
}

function defaultParseQueryString(queryString) {
  return qs.parse(queryString);
}

function useQueries(createHistory) {
  return (options) => {
    var history = createHistory(options);

    var { stringifyQuery, parseQueryString } = options || {};

    if (typeof stringifyQuery !== 'function')
      stringifyQuery = defaultStringifyQuery;

    if (typeof parseQueryString !== 'function')
      parseQueryString = defaultParseQueryString;

    function listen(listener) {
      return history.listen(function (location) {
        if (!location.query)
          location.query = parseQueryString(location.search.substring(1));

        listener(location);
      });
    }

    function createPath(pathname, query) {
      var queryString;
      if (query == null || (queryString = stringifyQuery(query)) === '')
        return pathname;

      return history.createPath(
        pathname + (pathname.indexOf('?') === -1 ? '?' : '&') + queryString
      );
    }

    function pushState(state, pathname, query) {
      return history.pushState(state, createPath(pathname, query));
    }

    function replaceState(state, pathname, query) {
      return history.replaceState(state, createPath(pathname, query));
    }

    function createHref(pathname, query) {
      return history.createHref(createPath(pathname, query));
    }

    return {
      ...history,
      listen,
      pushState,
      replaceState,
      createPath,
      createHref
    };
  };
}

export default useQueries;
