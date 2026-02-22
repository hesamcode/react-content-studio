export function debounce(callback, delay = 400) {
  let timeoutId;
  let lastArgs;
  let lastThis;

  function run() {
    timeoutId = undefined;
    callback.apply(lastThis, lastArgs);
  }

  function debounced(...args) {
    lastArgs = args;
    lastThis = this;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(run, delay);
  }

  debounced.cancel = () => {
    if (!timeoutId) {
      return;
    }

    clearTimeout(timeoutId);
    timeoutId = undefined;
  };

  debounced.flush = (...args) => {
    if (args.length > 0) {
      lastArgs = args;
    }

    if (!timeoutId) {
      if (lastArgs) {
        callback.apply(lastThis, lastArgs);
      }

      return;
    }

    clearTimeout(timeoutId);
    run();
  };

  return debounced;
}
