/**
 * A URL path including the pathname, search string, and hash. No URL
 * protocol or domain information should be part of a path.
 */
export type Path = string;

type Writable<O> = {
  -readonly [K in keyof O]: O[K]
}
/**
 * The pieces of a URL path.
 */
export type PathPieces = {
  /**
   * The URL pathname, beginning with a /.
   */
  readonly pathname?: string;

  /**
   * The URL search string, beginning with a ?.
   */
  readonly search?: string;

  /**
   * The URL fragment identifier, beginning with a #.
   */
  readonly hash?: string;
};

/**
 * An object that is used to associate some arbitrary data with a
 * location, but that does not appear in the URL path.
 */
export type State = object;

/**
 * Actions represent the type of change to a location value.
 */
export enum Action {
  Pop = 'POP',
  Push = 'PUSH',
  Replace = 'REPLACE'
}

/**
 * A location represents the current state in a history stack. It contains
 * information about the URL path, as well as some state and a key. Analogous
 * to the web's window.location API, but much smaller.
 *
 * @typeParam S - The type for the state object (optional)
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/location
 */
export interface Location<S extends State = State> extends PathPieces {
  /**
   * The URL pathname, beginning with a /.
   */
  readonly pathname: string;

  /**
   * The URL search string, beginning with a ?.
   */
  readonly search: string;

  /**
   * The URL fragment identifier, beginning with a #.
   */
  readonly hash: string;

  /**
   * Some state associated with this location.
   */
  readonly state?: S;

  /**
   * A unique string associated with this location. May be used to
   * safely store and retrieve data in some other storage API, like
   * `localStorage`. This value is always "default" on the initial
   * location.
   */
  readonly key: string;
}

/**
 * A change to the current location.
 *
 * @typeParam S - The type for the location's state object (optional)
 */
export interface Update<S extends State = State> {
  /**
   * The action that triggered the change.
   */
  readonly action: Action;

  /**
   * The new location.
   */
  readonly location: Location<S>;
}

/**
 * A function that receives notifications about location changes.
 *
 * @typeParam S - The type for the location's state object (optional)
 */
export interface Listener<S extends State = State> {
  (update: Update<S>): void;
}

/**
 * A change to the current location that was blocked. May be retried
 * after obtaining user confirmation.
 *
 * @typeParam S - The type for the location's state object (optional)
 */
export interface Transition<S extends State = State> extends Update<S> {
  /**
   * Retries the update to the current location.
   */
  retry(): void;
}

/**
 * A function that receives transitions when navigation is blocked.
 *
 * @typeParam S - The type for the location's state object (optional)
 */
export interface Blocker<S extends State = State> {
  (tx: Transition<S>): void;
}

/**
 * A `to` value is either a URL path or an object that contains the pieces
 * of a URL path.
 */
export type To = Path | PathPieces;

/**
 * A history is an interface to the navigation stack. The history serves
 * as the source of truth for the current location, as well as provides a
 * set of methods that may be used to change it.
 *
 * It is analogous to the web's window.history object, but with a smaller,
 * more focused API.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/history
 */
export interface History<S extends State = State> {
  /**
   * The last action that modified the current location. This will always
   * be Action.Pop when a history instance is first created. This value is
   * mutable.
   */
  readonly action: Action;

  /**
   * The current location. This value is mutable.
   */
  readonly location: Location<S>;

  /**
   * Returns a valid href for the given `to` value that may be used as
   * the value of an <a href> attribute.
   *
   * @param to - The destination URL
   */
  createHref(to: Path | PathPieces): string;

  /**
   * Pushes a new location onto the history stack, increasing its length
   * by one. If there were any entries in the stack after the current one,
   * they are lost.
   *
   * @param to - The new URL
   * @param state - Data to associate with the new location
   */
  push(to: To, state?: State): void;

  /**
   * Replaces the current location in the history stack with a new one.
   * The location that was replaced will no longer be available.
   *
   * @param to - The new URL
   * @param state - Data to associate with the new location
   */
  replace(to: To, state?: State): void;

  /**
   * Navigates `n` entries backward/forward in the history stack relative
   * to the current index. For example, a "back" navigation would use go(-1).
   *
   * @param n - The delta in the stack index
   */
  go(n: number): void;

  /**
   * Navigates to the previous entry in the stack. Identical to go(-1).
   *
   * Warning: if the current location is the first location in the stack,
   * this will unload the current document.
   */
  back(): void;

  /**
   * Navigates to the next entry in the stack. Identical to go(1).
   */
  forward(): void;

  /**
   * Sets up a listener that will be called whenever the current location
   * changes.
   *
   * @returns unlisten - A function that may be used to stop listening
   */
  listen(listener: Listener<S>): () => void;

  /**
   * Prevents the current location from changing and sets up a listener
   * that will be called instead.
   *
   * @returns unblock - A function that may be used to stop blocking
   */
  block(blocker: Blocker<S>): () => void;
}

/**
 * A browser history stores the current location in regular URLs in a
 * web browser environment. This is the standard for most web apps and
 * provides the cleanest URLs the browser's address bar.
 */
export interface BrowserHistory<S extends State = State> extends History<S> {}

/**
 * A hash history stores the current location in the fragment identifier
 * portion of the URL in a web browser environment.
 *
 * This is ideal for apps that do not control the server for some reason
 * (because the fragment identifier is never sent to the server), including
 * some shared hosting environments that do not provide fine-grained controls
 * over which pages are served at which URLs.
 */
export interface HashHistory<S extends State = State> extends History<S> {}

/**
 * A memory history stores locations in memory. This is useful in stateful
 * environments where there is no web browser, such as node tests or React
 * Native.
 */
export interface MemoryHistory<S extends State = State> extends History<S> {
  readonly index: number;
}

type HistoryState = {
  readonly usr?: State;
  readonly key?: string;
  readonly idx: number;
};

const BeforeUnloadEventType = 'beforeunload';
const HashChangeEventType = 'hashchange';
const PopStateEventType = 'popstate';

const readOnly: typeof Object.freeze = __DEV__
  ? Object.freeze
  : (obj: any) => obj;

function warning(cond: boolean, message: string) {
  if (!cond) {
    // eslint-disable-next-line no-console
    if (typeof console !== 'undefined') console.warn(message);

    try {
      throw new Error(message);
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }
}

////////////////////////////////////////////////////////////////////////////////
// BROWSER
////////////////////////////////////////////////////////////////////////////////

/**
 * Browser history stores the location in regular URLs. This is the
 * standard for most web apps, but it requires some configuration on
 * the server to ensure you serve the same app at multiple URLs.
 */
export function createBrowserHistory({
  window = document.defaultView!
}: { window?: Window } = {}): BrowserHistory {
  let globalHistory = window.history;

  function getIndexAndLocation(): [number, Location] {
    let { pathname, search, hash } = window.location;
    let state = globalHistory.state || {};
    return [
      state.idx,
      readOnly({
        pathname,
        search,
        hash,
        state: state.usr || null,
        key: state.key || 'default'
      })
    ];
  }

  let blockedPopTx: Transition | null = null;
  function handlePop() {
    if (blockedPopTx) {
      blockers.call(blockedPopTx);
      blockedPopTx = null;
    } else {
      let nextAction = Action.Pop;
      let [nextIndex, nextLocation] = getIndexAndLocation();

      if (blockers.length) {
        if (nextIndex != null) {
          let n = index - nextIndex;
          if (n) {
            // Revert the POP
            blockedPopTx = {
              action: nextAction,
              location: nextLocation,
              retry() {
                go(n * -1);
              }
            };

            go(n);
          }
        } else {
          // Trying to POP to a location with no index. We did not create
          // this location, so we can't effectively block the navigation.
          warning(
            false,
            // TODO: Write up a doc that explains our blocking strategy in
            // detail and link to it here so people can understand better
            // what is going on and how to avoid it.
            `You are trying to block a POP navigation to a location that was not ` +
              `created by the history library. The block will fail silently in ` +
              `production, but in general you should do all navigation with the ` +
              `history library (instead of using window.history.pushState directly) ` +
              `to avoid this situation.`
          );
        }
      } else {
        applyTx(nextAction);
      }
    }
  }

  window.addEventListener(PopStateEventType, handlePop);

  let action = Action.Pop;
  let [index, location] = getIndexAndLocation();
  let blockers = createEvents();
  let listeners = createEvents();

  if (index == null) {
    index = 0;
    globalHistory.replaceState(
      Object.assign({}, globalHistory.state, { idx: index }),
      ''
    );
  }

  function createHref(to: To) {
    return typeof to === 'string' ? to : createPath(to);
  }

  function getNextLocation(to: To, state?: State): Location {
    return readOnly(
      Object.assign({}, location, typeof to === 'string' ? parsePath(to) : to, {
        state,
        key: createKey()
      })
    );
  }

  function getHistoryStateAndUrl(
    nextLocation: Location,
    index: number
  ): [HistoryState, string] {
    return [
      {
        usr: nextLocation.state,
        key: nextLocation.key,
        idx: index
      },
      createHref(nextLocation)
    ];
  }

  function allowTx(action: Action, location: Location, retry: () => void) {
    return (
      !blockers.length || (blockers.call({ action, location, retry }), false)
    );
  }

  function applyTx(nextAction: Action) {
    action = nextAction;
    [index, location] = getIndexAndLocation();
    listeners.call({ action, location });
  }

  function push(to: To, state?: State) {
    let nextAction = Action.Push;
    let nextLocation = getNextLocation(to, state);
    function retry() {
      push(to, state);
    }

    if (allowTx(nextAction, nextLocation, retry)) {
      let [historyState, url] = getHistoryStateAndUrl(nextLocation, index + 1);

      // TODO: Support forced reloading
      // try...catch because iOS limits us to 100 pushState calls :/
      try {
        globalHistory.pushState(historyState, '', url);
      } catch (error) {
        // They are going to lose state here, but there is no real
        // way to warn them about it since the page will refresh...
        window.location.assign(url);
      }

      applyTx(nextAction);
    }
  }

  function replace(to: To, state?: State) {
    let nextAction = Action.Replace;
    let nextLocation = getNextLocation(to, state);
    function retry() {
      replace(to, state);
    }

    if (allowTx(nextAction, nextLocation, retry)) {
      let [historyState, url] = getHistoryStateAndUrl(nextLocation, index);

      // TODO: Support forced reloading
      globalHistory.replaceState(historyState, '', url);

      applyTx(nextAction);
    }
  }

  function go(n: number) {
    globalHistory.go(n);
  }

  let history: BrowserHistory = {
    get action() {
      return action;
    },
    get location() {
      return location;
    },
    createHref,
    push,
    replace,
    go,
    back() {
      go(-1);
    },
    forward() {
      go(1);
    },
    listen(listener) {
      return listeners.push(listener);
    },
    block(blocker) {
      let unblock = blockers.push(blocker);

      if (blockers.length === 1) {
        window.addEventListener(BeforeUnloadEventType, promptBeforeUnload);
      }

      return function() {
        unblock();

        // Remove the beforeunload listener so the document may
        // still be salvageable in the pagehide event.
        // See https://html.spec.whatwg.org/#unloading-documents
        if (!blockers.length) {
          window.removeEventListener(BeforeUnloadEventType, promptBeforeUnload);
        }
      };
    }
  };

  return history;
}

////////////////////////////////////////////////////////////////////////////////
// HASH
////////////////////////////////////////////////////////////////////////////////

/**
 * Hash history stores the location in window.location.hash. This makes
 * it ideal for situations where you don't want to send the location to
 * the server for some reason, either because you do cannot configure it
 * or the URL space is reserved for something else.
 */
export function createHashHistory({
  window = document.defaultView as Window
}: { window?: Window } = {}): HashHistory {
  let globalHistory = window.history;

  function getIndexAndLocation(): [number, Location] {
    let { pathname = '/', search = '', hash = '' } = parsePath(
      window.location.hash.substr(1)
    );
    let state = globalHistory.state || {};
    return [
      state.idx,
      readOnly({
        pathname,
        search,
        hash,
        state: state.usr || null,
        key: state.key || 'default'
      })
    ];
  }

  let blockedPopTx: Transition | null = null;
  function handlePop() {
    if (blockedPopTx) {
      blockers.call(blockedPopTx);
      blockedPopTx = null;
    } else {
      let nextAction = Action.Pop;
      let [nextIndex, nextLocation] = getIndexAndLocation();

      if (blockers.length) {
        if (nextIndex != null) {
          let n = index - nextIndex;
          if (n) {
            // Revert the POP
            blockedPopTx = {
              action: nextAction,
              location: nextLocation,
              retry() {
                go(n * -1);
              }
            };

            go(n);
          }
        } else {
          // Trying to POP to a location with no index. We did not create
          // this location, so we can't effectively block the navigation.
          warning(
            false,
            // TODO: Write up a doc that explains our blocking strategy in
            // detail and link to it here so people can understand better
            // what is going on and how to avoid it.
            `You are trying to block a POP navigation to a location that was not ` +
              `created by the history library. The block will fail silently in ` +
              `production, but in general you should do all navigation with the ` +
              `history library (instead of using window.history.pushState directly) ` +
              `to avoid this situation.`
          );
        }
      } else {
        applyTx(nextAction);
      }
    }
  }

  window.addEventListener(PopStateEventType, handlePop);

  // popstate does not fire on hashchange in IE 11 and old (trident) Edge
  // https://developer.mozilla.org/de/docs/Web/API/Window/popstate_event
  window.addEventListener(HashChangeEventType, () => {
    let [, nextLocation] = getIndexAndLocation();

    // Ignore extraneous hashchange events.
    if (createPath(nextLocation) !== createPath(location)) {
      handlePop();
    }
  });

  let action = Action.Pop;
  let [index, location] = getIndexAndLocation();
  let blockers = createEvents();
  let listeners = createEvents();

  if (index == null) {
    index = 0;
    globalHistory.replaceState(
      Object.assign({}, globalHistory.state, { idx: index }),
      ''
    );
  }

  function getBaseHref() {
    let base = document.querySelector('base');
    let href = '';

    if (base && base.getAttribute('href')) {
      let url = window.location.href;
      let hashIndex = url.indexOf('#');
      href = hashIndex === -1 ? url : url.slice(0, hashIndex);
    }

    return href;
  }

  function createHref(to: To) {
    return getBaseHref() + '#' + (typeof to === 'string' ? to : createPath(to));
  }

  function getNextLocation(to: To, state?: State): Location {
    return readOnly(
      Object.assign({}, location, typeof to === 'string' ? parsePath(to) : to, {
        state,
        key: createKey()
      })
    );
  }

  function getHistoryStateAndUrl(
    nextLocation: Location,
    index: number
  ): [HistoryState, string] {
    return [
      {
        usr: nextLocation.state,
        key: nextLocation.key,
        idx: index
      },
      createHref(nextLocation)
    ];
  }

  function allowTx(action: Action, location: Location, retry: () => void) {
    return (
      !blockers.length || (blockers.call({ action, location, retry }), false)
    );
  }

  function applyTx(nextAction: Action) {
    action = nextAction;
    [index, location] = getIndexAndLocation();
    listeners.call({ action, location });
  }

  function push(to: To, state?: State) {
    let nextAction = Action.Push;
    let nextLocation = getNextLocation(to, state);
    function retry() {
      push(to, state);
    }

    warning(
      nextLocation.pathname.charAt(0) === '/',
      `Relative pathnames are not supported in hash history.push(${JSON.stringify(
        to
      )})`
    );

    if (allowTx(nextAction, nextLocation, retry)) {
      let [historyState, url] = getHistoryStateAndUrl(nextLocation, index + 1);

      // TODO: Support forced reloading
      // try...catch because iOS limits us to 100 pushState calls :/
      try {
        globalHistory.pushState(historyState, '', url);
      } catch (error) {
        // They are going to lose state here, but there is no real
        // way to warn them about it since the page will refresh...
        window.location.assign(url);
      }

      applyTx(nextAction);
    }
  }

  function replace(to: To, state?: State) {
    let nextAction = Action.Replace;
    let nextLocation = getNextLocation(to, state);
    function retry() {
      replace(to, state);
    }

    warning(
      nextLocation.pathname.charAt(0) === '/',
      `Relative pathnames are not supported in hash history.replace(${JSON.stringify(
        to
      )})`
    );

    if (allowTx(nextAction, nextLocation, retry)) {
      let [historyState, url] = getHistoryStateAndUrl(nextLocation, index);

      // TODO: Support forced reloading
      globalHistory.replaceState(historyState, '', url);

      applyTx(nextAction);
    }
  }

  function go(n: number) {
    globalHistory.go(n);
  }

  let history: HashHistory = {
    get action() {
      return action;
    },
    get location() {
      return location;
    },
    createHref,
    push,
    replace,
    go,
    back() {
      go(-1);
    },
    forward() {
      go(1);
    },
    listen(listener) {
      return listeners.push(listener);
    },
    block(blocker) {
      let unblock = blockers.push(blocker);

      if (blockers.length === 1) {
        window.addEventListener(BeforeUnloadEventType, promptBeforeUnload);
      }

      return function() {
        unblock();

        // Remove the beforeunload listener so the document may
        // still be salvageable in the pagehide event.
        // See https://html.spec.whatwg.org/#unloading-documents
        if (!blockers.length) {
          window.removeEventListener(BeforeUnloadEventType, promptBeforeUnload);
        }
      };
    }
  };

  return history;
}

////////////////////////////////////////////////////////////////////////////////
// MEMORY
////////////////////////////////////////////////////////////////////////////////

type InitialEntry = Path | PathPieces;

/**
 * Memory history stores the current location in memory. It is designed
 * for use in stateful non-browser environments like headless tests (in
 * node.js) and React Native.
 */
export function createMemoryHistory({
  initialEntries = ['/'],
  initialIndex = 0
}: {
  initialEntries?: ReadonlyArray<InitialEntry>;
  initialIndex?: number;
} = {}): MemoryHistory {
  let entries = initialEntries.map((entry): Location => {
    let location = readOnly(
      Object.assign(
        {
          pathname: '/',
          search: '',
          hash: '',
          state: undefined,
          key: createKey()
        },
        typeof entry === 'string' ? parsePath(entry) : entry
      )
    );

    warning(
      location.pathname.charAt(0) === '/',
      `Relative pathnames are not supported in createMemoryHistory({ initialEntries }) (invalid entry: ${JSON.stringify(
        entry
      )})`
    );

    return location;
  });
  let index = clamp(initialIndex, 0, entries.length - 1);

  let action = Action.Pop;
  let location = entries[index];
  let blockers = createEvents<Blocker>();
  let listeners = createEvents<Listener>();

  function createHref(to: To) {
    return typeof to === 'string' ? to : createPath(to);
  }

  function getNextLocation(to: To, state?: State): Location {
    return readOnly(
      Object.assign({}, location, typeof to === 'string' ? parsePath(to) : to, {
        state,
        key: createKey()
      })
    );
  }

  function allowTx(action: Action, location: Location, retry: () => void) {
    return (
      !blockers.length || (blockers.call({ action, location, retry }), false)
    );
  }

  function applyTx(nextAction: Action, nextLocation: Location) {
    action = nextAction;
    location = nextLocation;
    listeners.call({ action, location });
  }

  function push(to: To, state?: State) {
    let nextAction = Action.Push;
    let nextLocation = getNextLocation(to, state);
    function retry() {
      push(to, state);
    }

    warning(
      location.pathname.charAt(0) === '/',
      `Relative pathnames are not supported in memory history.push(${JSON.stringify(
        to
      )})`
    );

    if (allowTx(nextAction, nextLocation, retry)) {
      index += 1;
      entries.splice(index, entries.length, nextLocation);
      applyTx(nextAction, nextLocation);
    }
  }

  function replace(to: To, state?: State) {
    let nextAction = Action.Replace;
    let nextLocation = getNextLocation(to, state);
    function retry() {
      replace(to, state);
    }

    warning(
      location.pathname.charAt(0) === '/',
      `Relative pathnames are not supported in memory history.replace(${JSON.stringify(
        to
      )})`
    );

    if (allowTx(nextAction, nextLocation, retry)) {
      entries[index] = nextLocation;
      applyTx(nextAction, nextLocation);
    }
  }

  function go(n: number) {
    let nextIndex = clamp(index + n, 0, entries.length - 1);
    let nextAction = Action.Pop;
    let nextLocation = entries[nextIndex];
    function retry() {
      go(n);
    }

    if (allowTx(nextAction, nextLocation, retry)) {
      index = nextIndex;
      applyTx(nextAction, nextLocation);
    }
  }

  let history: MemoryHistory = {
    get index() {
      return index;
    },
    get action() {
      return action;
    },
    get location() {
      return location;
    },
    createHref,
    push,
    replace,
    go,
    back() {
      go(-1);
    },
    forward() {
      go(1);
    },
    listen(listener) {
      return listeners.push(listener);
    },
    block(blocker) {
      return blockers.push(blocker);
    }
  };

  return history;
}

function clamp(n: number, lowerBound: number, upperBound: number) {
  return Math.min(Math.max(n, lowerBound), upperBound);
}

////////////////////////////////////////////////////////////////////////////////
// UTILS
////////////////////////////////////////////////////////////////////////////////

function promptBeforeUnload(event: BeforeUnloadEvent) {
  // Cancel the event.
  event.preventDefault();
  // Chrome (and legacy IE) requires returnValue to be set.
  event.returnValue = '';
}

type Events<F extends (arg:any) => void> = {
  readonly length: number;
  push: (fn: F) => () => void;
  call: (arg: Parameters<F>[0]) => void;
};

function createEvents<F extends (arg: any) => void>(): Events<F> {
  let handlers: F[] = [];

  return {
    get length() {
      return handlers.length;
    },
    push(fn) {
      handlers.push(fn);
      return function() {
        handlers = handlers.filter(handler => handler !== fn);
      };
    },
    call(arg) {
      handlers.forEach(fn => fn && fn(arg));
    }
  };
}

function createKey() {
  return Math.random()
    .toString(36)
    .substr(2, 8);
}

export function createPath({
  pathname = '/',
  search = '',
  hash = ''
}: PathPieces) {
  return pathname + search + hash;
}

export function parsePath(path: Path): PathPieces {
  let pieces: Writable<PathPieces> = {};

  if (path) {
    let hashIndex = path.indexOf('#');
    if (hashIndex >= 0) {
      pieces.hash = path.substr(hashIndex);
      path = path.substr(0, hashIndex);
    }

    let searchIndex = path.indexOf('?');
    if (searchIndex >= 0) {
      pieces.search = path.substr(searchIndex);
      path = path.substr(0, searchIndex);
    }

    if (path) {
      pieces.pathname = path;
    }
  }

  return pieces;
}
