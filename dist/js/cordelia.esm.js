/*!
 *   Cordelia color picker
 *   version: 1.0.3
 *    author: Cevad Tokatli <cevadtokatli@hotmail.com>
 *   website: http://cevadtokatli.com
 *    github: https://github.com/cevadtokatli/cordelia
 *   license: MIT
 */

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var es6Promise = createCommonjsModule(function (module, exports) {
  /*!
   * @overview es6-promise - a tiny implementation of Promises/A+.
   * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
   * @license   Licensed under MIT license
   *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
   * @version   v4.2.5+7f2b526d
   */

  (function (global, factory) {
    module.exports = factory();
  })(commonjsGlobal, function () {

    function objectOrFunction(x) {
      var type = typeof x === 'undefined' ? 'undefined' : _typeof(x);
      return x !== null && (type === 'object' || type === 'function');
    }

    function isFunction(x) {
      return typeof x === 'function';
    }

    var _isArray = void 0;
    if (Array.isArray) {
      _isArray = Array.isArray;
    } else {
      _isArray = function _isArray(x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    }

    var isArray = _isArray;

    var len = 0;
    var vertxNext = void 0;
    var customSchedulerFn = void 0;

    var asap = function asap(callback, arg) {
      queue[len] = callback;
      queue[len + 1] = arg;
      len += 2;
      if (len === 2) {
        // If len is 2, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        if (customSchedulerFn) {
          customSchedulerFn(flush);
        } else {
          scheduleFlush();
        }
      }
    };

    function setScheduler(scheduleFn) {
      customSchedulerFn = scheduleFn;
    }

    function setAsap(asapFn) {
      asap = asapFn;
    }

    var browserWindow = typeof window !== 'undefined' ? window : undefined;
    var browserGlobal = browserWindow || {};
    var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
    var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

    // node
    function useNextTick() {
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // see https://github.com/cujojs/when/issues/410 for details
      return function () {
        return process.nextTick(flush);
      };
    }

    // vertx
    function useVertxTimer() {
      if (typeof vertxNext !== 'undefined') {
        return function () {
          vertxNext(flush);
        };
      }

      return useSetTimeout();
    }

    function useMutationObserver() {
      var iterations = 0;
      var observer = new BrowserMutationObserver(flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function () {
        node.data = iterations = ++iterations % 2;
      };
    }

    // web worker
    function useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = flush;
      return function () {
        return channel.port2.postMessage(0);
      };
    }

    function useSetTimeout() {
      // Store setTimeout reference so es6-promise will be unaffected by
      // other code modifying setTimeout (like sinon.useFakeTimers())
      var globalSetTimeout = setTimeout;
      return function () {
        return globalSetTimeout(flush, 1);
      };
    }

    var queue = new Array(1000);
    function flush() {
      for (var i = 0; i < len; i += 2) {
        var callback = queue[i];
        var arg = queue[i + 1];

        callback(arg);

        queue[i] = undefined;
        queue[i + 1] = undefined;
      }

      len = 0;
    }

    function attemptVertx() {
      try {
        var vertx = Function('return this')().require('vertx');
        vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return useVertxTimer();
      } catch (e) {
        return useSetTimeout();
      }
    }

    var scheduleFlush = void 0;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (isNode) {
      scheduleFlush = useNextTick();
    } else if (BrowserMutationObserver) {
      scheduleFlush = useMutationObserver();
    } else if (isWorker) {
      scheduleFlush = useMessageChannel();
    } else if (browserWindow === undefined && typeof commonjsRequire === 'function') {
      scheduleFlush = attemptVertx();
    } else {
      scheduleFlush = useSetTimeout();
    }

    function then(onFulfillment, onRejection) {
      var parent = this;

      var child = new this.constructor(noop);

      if (child[PROMISE_ID] === undefined) {
        makePromise(child);
      }

      var _state = parent._state;

      if (_state) {
        var callback = arguments[_state - 1];
        asap(function () {
          return invokeCallback(_state, child, callback, parent._result);
        });
      } else {
        subscribe(parent, child, onFulfillment, onRejection);
      }

      return child;
    }

    /**
      `Promise.resolve` returns a promise that will become resolved with the
      passed `value`. It is shorthand for the following:
    
      ```javascript
      let promise = new Promise(function(resolve, reject){
        resolve(1);
      });
    
      promise.then(function(value){
        // value === 1
      });
      ```
    
      Instead of writing the above, your code now simply becomes the following:
    
      ```javascript
      let promise = Promise.resolve(1);
    
      promise.then(function(value){
        // value === 1
      });
      ```
    
      @method resolve
      @static
      @param {Any} value value that the returned promise will be resolved with
      Useful for tooling.
      @return {Promise} a promise that will become fulfilled with the given
      `value`
    */
    function resolve$1(object) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(noop);
      resolve(promise, object);
      return promise;
    }

    var PROMISE_ID = Math.random().toString(36).substring(2);

    function noop() {}

    var PENDING = void 0;
    var FULFILLED = 1;
    var REJECTED = 2;

    var TRY_CATCH_ERROR = { error: null };

    function selfFulfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function getThen(promise) {
      try {
        return promise.then;
      } catch (error) {
        TRY_CATCH_ERROR.error = error;
        return TRY_CATCH_ERROR;
      }
    }

    function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
      try {
        then$$1.call(value, fulfillmentHandler, rejectionHandler);
      } catch (e) {
        return e;
      }
    }

    function handleForeignThenable(promise, thenable, then$$1) {
      asap(function (promise) {
        var sealed = false;
        var error = tryThen(then$$1, thenable, function (value) {
          if (sealed) {
            return;
          }
          sealed = true;
          if (thenable !== value) {
            resolve(promise, value);
          } else {
            fulfill(promise, value);
          }
        }, function (reason) {
          if (sealed) {
            return;
          }
          sealed = true;

          reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          reject(promise, error);
        }
      }, promise);
    }

    function handleOwnThenable(promise, thenable) {
      if (thenable._state === FULFILLED) {
        fulfill(promise, thenable._result);
      } else if (thenable._state === REJECTED) {
        reject(promise, thenable._result);
      } else {
        subscribe(thenable, undefined, function (value) {
          return resolve(promise, value);
        }, function (reason) {
          return reject(promise, reason);
        });
      }
    }

    function handleMaybeThenable(promise, maybeThenable, then$$1) {
      if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
        handleOwnThenable(promise, maybeThenable);
      } else {
        if (then$$1 === TRY_CATCH_ERROR) {
          reject(promise, TRY_CATCH_ERROR.error);
          TRY_CATCH_ERROR.error = null;
        } else if (then$$1 === undefined) {
          fulfill(promise, maybeThenable);
        } else if (isFunction(then$$1)) {
          handleForeignThenable(promise, maybeThenable, then$$1);
        } else {
          fulfill(promise, maybeThenable);
        }
      }
    }

    function resolve(promise, value) {
      if (promise === value) {
        reject(promise, selfFulfillment());
      } else if (objectOrFunction(value)) {
        handleMaybeThenable(promise, value, getThen(value));
      } else {
        fulfill(promise, value);
      }
    }

    function publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      publish(promise);
    }

    function fulfill(promise, value) {
      if (promise._state !== PENDING) {
        return;
      }

      promise._result = value;
      promise._state = FULFILLED;

      if (promise._subscribers.length !== 0) {
        asap(publish, promise);
      }
    }

    function reject(promise, reason) {
      if (promise._state !== PENDING) {
        return;
      }
      promise._state = REJECTED;
      promise._result = reason;

      asap(publishRejection, promise);
    }

    function subscribe(parent, child, onFulfillment, onRejection) {
      var _subscribers = parent._subscribers;
      var length = _subscribers.length;

      parent._onerror = null;

      _subscribers[length] = child;
      _subscribers[length + FULFILLED] = onFulfillment;
      _subscribers[length + REJECTED] = onRejection;

      if (length === 0 && parent._state) {
        asap(publish, parent);
      }
    }

    function publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) {
        return;
      }

      var child = void 0,
          callback = void 0,
          detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch (e) {
        TRY_CATCH_ERROR.error = e;
        return TRY_CATCH_ERROR;
      }
    }

    function invokeCallback(settled, promise, callback, detail) {
      var hasCallback = isFunction(callback),
          value = void 0,
          error = void 0,
          succeeded = void 0,
          failed = void 0;

      if (hasCallback) {
        value = tryCatch(callback, detail);

        if (value === TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value.error = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          reject(promise, cannotReturnOwn());
          return;
        }
      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== PENDING) ; else if (hasCallback && succeeded) {
        resolve(promise, value);
      } else if (failed) {
        reject(promise, error);
      } else if (settled === FULFILLED) {
        fulfill(promise, value);
      } else if (settled === REJECTED) {
        reject(promise, value);
      }
    }

    function initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value) {
          resolve(promise, value);
        }, function rejectPromise(reason) {
          reject(promise, reason);
        });
      } catch (e) {
        reject(promise, e);
      }
    }

    var id = 0;
    function nextId() {
      return id++;
    }

    function makePromise(promise) {
      promise[PROMISE_ID] = id++;
      promise._state = undefined;
      promise._result = undefined;
      promise._subscribers = [];
    }

    function validationError() {
      return new Error('Array Methods must be provided an Array');
    }

    var Enumerator = function () {
      function Enumerator(Constructor, input) {
        this._instanceConstructor = Constructor;
        this.promise = new Constructor(noop);

        if (!this.promise[PROMISE_ID]) {
          makePromise(this.promise);
        }

        if (isArray(input)) {
          this.length = input.length;
          this._remaining = input.length;

          this._result = new Array(this.length);

          if (this.length === 0) {
            fulfill(this.promise, this._result);
          } else {
            this.length = this.length || 0;
            this._enumerate(input);
            if (this._remaining === 0) {
              fulfill(this.promise, this._result);
            }
          }
        } else {
          reject(this.promise, validationError());
        }
      }

      Enumerator.prototype._enumerate = function _enumerate(input) {
        for (var i = 0; this._state === PENDING && i < input.length; i++) {
          this._eachEntry(input[i], i);
        }
      };

      Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
        var c = this._instanceConstructor;
        var resolve$$1 = c.resolve;

        if (resolve$$1 === resolve$1) {
          var _then = getThen(entry);

          if (_then === then && entry._state !== PENDING) {
            this._settledAt(entry._state, i, entry._result);
          } else if (typeof _then !== 'function') {
            this._remaining--;
            this._result[i] = entry;
          } else if (c === Promise$1) {
            var promise = new c(noop);
            handleMaybeThenable(promise, entry, _then);
            this._willSettleAt(promise, i);
          } else {
            this._willSettleAt(new c(function (resolve$$1) {
              return resolve$$1(entry);
            }), i);
          }
        } else {
          this._willSettleAt(resolve$$1(entry), i);
        }
      };

      Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
        var promise = this.promise;

        if (promise._state === PENDING) {
          this._remaining--;

          if (state === REJECTED) {
            reject(promise, value);
          } else {
            this._result[i] = value;
          }
        }

        if (this._remaining === 0) {
          fulfill(promise, this._result);
        }
      };

      Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
        var enumerator = this;

        subscribe(promise, undefined, function (value) {
          return enumerator._settledAt(FULFILLED, i, value);
        }, function (reason) {
          return enumerator._settledAt(REJECTED, i, reason);
        });
      };

      return Enumerator;
    }();

    /**
      `Promise.all` accepts an array of promises, and returns a new promise which
      is fulfilled with an array of fulfillment values for the passed promises, or
      rejected with the reason of the first passed promise to be rejected. It casts all
      elements of the passed iterable to promises as it runs this algorithm.
    
      Example:
    
      ```javascript
      let promise1 = resolve(1);
      let promise2 = resolve(2);
      let promise3 = resolve(3);
      let promises = [ promise1, promise2, promise3 ];
    
      Promise.all(promises).then(function(array){
        // The array here would be [ 1, 2, 3 ];
      });
      ```
    
      If any of the `promises` given to `all` are rejected, the first promise
      that is rejected will be given as an argument to the returned promises's
      rejection handler. For example:
    
      Example:
    
      ```javascript
      let promise1 = resolve(1);
      let promise2 = reject(new Error("2"));
      let promise3 = reject(new Error("3"));
      let promises = [ promise1, promise2, promise3 ];
    
      Promise.all(promises).then(function(array){
        // Code here never runs because there are rejected promises!
      }, function(error) {
        // error.message === "2"
      });
      ```
    
      @method all
      @static
      @param {Array} entries array of promises
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise} promise that is fulfilled when all `promises` have been
      fulfilled, or rejected if any of them become rejected.
      @static
    */
    function all(entries) {
      return new Enumerator(this, entries).promise;
    }

    /**
      `Promise.race` returns a new promise which is settled in the same way as the
      first passed promise to settle.
    
      Example:
    
      ```javascript
      let promise1 = new Promise(function(resolve, reject){
        setTimeout(function(){
          resolve('promise 1');
        }, 200);
      });
    
      let promise2 = new Promise(function(resolve, reject){
        setTimeout(function(){
          resolve('promise 2');
        }, 100);
      });
    
      Promise.race([promise1, promise2]).then(function(result){
        // result === 'promise 2' because it was resolved before promise1
        // was resolved.
      });
      ```
    
      `Promise.race` is deterministic in that only the state of the first
      settled promise matters. For example, even if other promises given to the
      `promises` array argument are resolved, but the first settled promise has
      become rejected before the other promises became fulfilled, the returned
      promise will become rejected:
    
      ```javascript
      let promise1 = new Promise(function(resolve, reject){
        setTimeout(function(){
          resolve('promise 1');
        }, 200);
      });
    
      let promise2 = new Promise(function(resolve, reject){
        setTimeout(function(){
          reject(new Error('promise 2'));
        }, 100);
      });
    
      Promise.race([promise1, promise2]).then(function(result){
        // Code here never runs
      }, function(reason){
        // reason.message === 'promise 2' because promise 2 became rejected before
        // promise 1 became fulfilled
      });
      ```
    
      An example real-world use case is implementing timeouts:
    
      ```javascript
      Promise.race([ajax('foo.json'), timeout(5000)])
      ```
    
      @method race
      @static
      @param {Array} promises array of promises to observe
      Useful for tooling.
      @return {Promise} a promise which settles in the same way as the first passed
      promise to settle.
    */
    function race(entries) {
      /*jshint validthis:true */
      var Constructor = this;

      if (!isArray(entries)) {
        return new Constructor(function (_, reject) {
          return reject(new TypeError('You must pass an array to race.'));
        });
      } else {
        return new Constructor(function (resolve, reject) {
          var length = entries.length;
          for (var i = 0; i < length; i++) {
            Constructor.resolve(entries[i]).then(resolve, reject);
          }
        });
      }
    }

    /**
      `Promise.reject` returns a promise rejected with the passed `reason`.
      It is shorthand for the following:
    
      ```javascript
      let promise = new Promise(function(resolve, reject){
        reject(new Error('WHOOPS'));
      });
    
      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```
    
      Instead of writing the above, your code now simply becomes the following:
    
      ```javascript
      let promise = Promise.reject(new Error('WHOOPS'));
    
      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```
    
      @method reject
      @static
      @param {Any} reason value that the returned promise will be rejected with.
      Useful for tooling.
      @return {Promise} a promise rejected with the given `reason`.
    */
    function reject$1(reason) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(noop);
      reject(promise, reason);
      return promise;
    }

    function needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.
    
      Terminology
      -----------
    
      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.
    
      A promise can be in one of three states: pending, fulfilled, or rejected.
    
      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.
    
      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.
    
    
      Basic Usage:
      ------------
    
      ```js
      let promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);
    
        // on failure
        reject(reason);
      });
    
      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```
    
      Advanced Usage:
      ---------------
    
      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.
    
      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          let xhr = new XMLHttpRequest();
    
          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();
    
          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }
    
      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```
    
      Unlike callbacks, promises are great composable primitives.
    
      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON
    
        return values;
      });
      ```
    
      @class Promise
      @param {Function} resolver
      Useful for tooling.
      @constructor
    */

    var Promise$1 = function () {
      function Promise(resolver) {
        this[PROMISE_ID] = nextId();
        this._result = this._state = undefined;
        this._subscribers = [];

        if (noop !== resolver) {
          typeof resolver !== 'function' && needsResolver();
          this instanceof Promise ? initializePromise(this, resolver) : needsNew();
        }
      }

      /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.
       ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```
       Chaining
      --------
       The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.
       ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });
       findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
       ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```
       Assimilation
      ------------
       Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.
       ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```
       If the assimliated promise rejects, then the downstream promise will also reject.
       ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```
       Simple Example
      --------------
       Synchronous Example
       ```javascript
      let result;
       try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```
       Errback Example
       ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```
       Promise Example;
       ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```
       Advanced Example
      --------------
       Synchronous Example
       ```javascript
      let author, books;
       try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```
       Errback Example
       ```js
       function foundBooks(books) {
       }
       function failure(reason) {
       }
       findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```
       Promise Example;
       ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```
       @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
      */

      /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.
      ```js
      function findAuthor(){
      throw new Error('couldn't find that author');
      }
      // synchronous
      try {
      findAuthor();
      } catch(reason) {
      // something went wrong
      }
      // async with promises
      findAuthor().catch(function(reason){
      // something went wrong
      });
      ```
      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
      */

      Promise.prototype.catch = function _catch(onRejection) {
        return this.then(null, onRejection);
      };

      /**
        `finally` will be invoked regardless of the promise's fate just as native
        try/catch/finally behaves
      
        Synchronous example:
      
        ```js
        findAuthor() {
          if (Math.random() > 0.5) {
            throw new Error();
          }
          return new Author();
        }
      
        try {
          return findAuthor(); // succeed or fail
        } catch(error) {
          return findOtherAuther();
        } finally {
          // always runs
          // doesn't affect the return value
        }
        ```
      
        Asynchronous example:
      
        ```js
        findAuthor().catch(function(reason){
          return findOtherAuther();
        }).finally(function(){
          // author was either found, or not
        });
        ```
      
        @method finally
        @param {Function} callback
        @return {Promise}
      */

      Promise.prototype.finally = function _finally(callback) {
        var promise = this;
        var constructor = promise.constructor;

        if (isFunction(callback)) {
          return promise.then(function (value) {
            return constructor.resolve(callback()).then(function () {
              return value;
            });
          }, function (reason) {
            return constructor.resolve(callback()).then(function () {
              throw reason;
            });
          });
        }

        return promise.then(callback, callback);
      };

      return Promise;
    }();

    Promise$1.prototype.then = then;
    Promise$1.all = all;
    Promise$1.race = race;
    Promise$1.resolve = resolve$1;
    Promise$1.reject = reject$1;
    Promise$1._setScheduler = setScheduler;
    Promise$1._setAsap = setAsap;
    Promise$1._asap = asap;

    /*global self*/
    function polyfill() {
      var local = void 0;

      if (typeof commonjsGlobal !== 'undefined') {
        local = commonjsGlobal;
      } else if (typeof self !== 'undefined') {
        local = self;
      } else {
        try {
          local = Function('return this')();
        } catch (e) {
          throw new Error('polyfill failed because global object is unavailable in this environment');
        }
      }

      var P = local.Promise;

      if (P) {
        var promiseToString = null;
        try {
          promiseToString = Object.prototype.toString.call(P.resolve());
        } catch (e) {
          // silently ignored
        }

        if (promiseToString === '[object Promise]' && !P.cast) {
          return;
        }
      }

      local.Promise = Promise$1;
    }

    // Strange compat..
    Promise$1.polyfill = polyfill;
    Promise$1.Promise = Promise$1;

    return Promise$1;
  });

  
});

var auto = es6Promise.polyfill();

/**
 * Creates a new event and initalizes it.
 *
 * @param {String} name
 * @returns {Event}
 */
function createEvent(name) {
    var event = void 0;
    if (typeof document !== 'undefined') {
        event = document.createEvent('HTMLEvents') || document.createEvent('event');
        event.initEvent(name, false, true);
    }
    return event;
}

var events = {
    open: createEvent('open'),
    close: createEvent('close'),
    save: createEvent('save'),
    cancel: createEvent('cancel'),
    changed: createEvent('changed')
};

// Holds the default settings.
var defaults$1 = {
    size: 'medium',
    embed: true,
    pickerStyle: 0,
    allowOpacity: true,
    allowClearColor: false,
    showColorValue: true,
    colorFormat: 'hex',
    color: '#FF0000',
    showButtons: true,
    showPalette: true,
    paletteColors: ['#FFFFB5', '#FBBD87', '#F45151', '#7AEA89', '#91C8E7', '#8EB4E6', '#B0A7F1'],
    allowPaletteAddColor: true
};

var Cordelia = function () {
    /**
     * @param {Object} o
     * @constructor
     */
    function Cordelia(o) {
        classCallCheck(this, Cordelia);

        // dont install if runs on the server.
        if (typeof window === 'undefined') {
            return;
        }

        // Stores the HTML Elements.
        this.elm = {};

        if (typeof o.elm == 'string') {
            this.elm.main = document.querySelector(o.elm);
        } else {
            this.elm.main = o.elm;
        }

        if (!this.elm.main) {
            throw new Error('Element could not be found');
        }

        this.el = this.elm.main; // For event listeners
        this.extractAttributes(o);

        // size
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && !this.embed) {
            this.size = 'small';
        } else if (this.size != 'small' && this.size != 'large') {
            this.size = 'medium';
        }

        // picker sizes
        this.majorPicker = {};
        this.minorPicker = {};
        this.opacityPicker = {};

        if (this.size == 'small') {
            this.majorPicker.width = 125;
            this.majorPicker.height = 125;
            this.minorPicker.width = 20;
            this.minorPicker.height = 125;
        } else if (this.size == 'medium') {
            this.majorPicker.width = 175;
            this.majorPicker.height = 175;
            this.minorPicker.width = 30;
            this.minorPicker.height = 175;
        } else {
            this.majorPicker.width = 250;
            this.majorPicker.height = 250;
            this.minorPicker.width = 30;
            this.minorPicker.height = 250;
        }
        this.majorPicker.subtractedValue = 9;
        this.minorPicker.subtractedValue = 7;

        if (this.allowOpacity) {
            this.opacityPicker.width = this.minorPicker.width;
            this.opacityPicker.height = this.minorPicker.height;
            this.opacityPicker.subtractedValue = this.minorPicker.subtractedValue;
        }

        if (this.pickerStyle != 0) {
            this.pickerStyle = 1;
        }
        if (this.colorFormat != 'rgb' && this.colorFormat != 'rgba' && this.colorFormat != 'hsl' && this.colorFormat != 'hsla') {
            this.colorFormat = 'hex';
        }
        if (!this.color) {
            if (this.allowClearColor) {
                this.color = null;
            } else {
                if (this.colorFormat == 'hex') {
                    this.color = '#FF000';
                } else if (this.colorFormat == 'rgb') {
                    this.color = 'rgb(255,0,0)';
                } else if (this.colorFormat == 'rgba') {
                    this.color = 'rgba(255,0,0,1)';
                } else if (this.colorFormat == 'hsl') {
                    this.color = 'hsl(0,100%,50%)';
                } else if (this.colorFormat == 'hsla') {
                    this.color = 'hsla(0,100%,50%,1)';
                }
            }
        }

        this.init();
    }

    /**
     * Extracts and merges attributes.
     *
     * @param {Object} o
     */


    createClass(Cordelia, [{
        key: 'extractAttributes',
        value: function extractAttributes(o) {
            for (var i in defaults$1) {
                if (typeof o[i] !== 'undefined') {
                    this[i] = o[i];
                } else {
                    this[i] = defaults$1[i];
                }
            }
        }

        /**
         * Creates html and event listeners.
         */

    }, {
        key: 'init',
        value: function init() {
            var _this = this;

            // Stores the bound function to remove the event listener.
            this.pickerMovedBind = this.pickerMoved.bind(this);
            this.pickerReleasedBind = this.pickerReleased.bind(this);
            this.closePickerBind = this.closePicker.bind(this);
            this.setPositionBind = this.setPosition.bind(this);

            if (!this.embed) {
                this.elm.main.classList.add('cdp-wrapper');
                this.elm.main.classList.add('cdp-background-type-opacity');
                this.elm.main.addEventListener('click', this.openPicker.bind(this));

                this.elm.overlay = document.createElement('div');
                this.elm.overlay.classList.add('cdp-wrapper-overlay');
                this.elm.main.appendChild(this.elm.overlay);

                this.elm.picker = document.createElement('div');
                this.elm.picker.classList.add('cdp-hidden');
                this.elm.overlay.appendChild(this.elm.picker);
            } else {
                this.elm.picker = this.elm.main;
            }
            this.elm.picker.classList.add('cdp-container');
            this.elm.picker.setAttribute('cdp-size', this.size);

            // Creates a DOM element to get the color as RGBA using the getRgbaColor function.
            this.elm.rgbaColor = document.createElement('div');
            this.elm.rgbaColor.classList.add('cdp-hidden');
            this.elm.picker.appendChild(this.elm.rgbaColor);

            this.rgbaColor = {}; //Holds RGBA values of the current color
            this.rgbaColor.a = 1;
            this.rgbColor = {}; //Holds the latest RGB value to calculate the new value when the picker position is changed on the palette
            this.hslColor = {}; //Holds the latest HSL value to calculate the new value when the picker position is changed on the palette

            // Sets the current and initial colors according to the color type.
            if (this.color) {
                var rgba = this.getRgbaValue(this.color),
                    currentColor = this.convertColor(rgba).value;

                this.color = currentColor;
                this.rgbaColor = rgba;
            }
            this.initialColor = this.color;

            // picker container
            var pickerContainer = document.createElement('div');
            pickerContainer.classList.add('cdp-picker-container');
            this.elm.picker.appendChild(pickerContainer);

            this.majorPicker.container = document.createElement('div');
            this.majorPicker.container.classList.add('cdp-major-picker');
            pickerContainer.appendChild(this.majorPicker.container);

            this.minorPicker.container = document.createElement('div');
            this.minorPicker.container.classList.add('cdp-minor-picker');
            pickerContainer.appendChild(this.minorPicker.container);

            if (this.pickerStyle == 0) {
                this.majorPicker.container.innerHTML = '<div class="cdp-major-picker-gradient cdp-background-type-current-color"><div class="cdp-major-picker-gradient cdp-gradient-type-lr-white"><div class="cdp-major-picker-gradient cdp-gradient-type-bt-black cdp-last-gradient-child"></div></div></div>';
                this.elm.pickerCurrentColorBackground = this.majorPicker.container.querySelector('.cdp-background-type-current-color');
                this.minorPicker.container.innerHTML = '<div class="cdp-minor-picker-gradient cdp-gradient-type-tb-colorful cdp-last-gradient-child"></div>';
            } else if (this.pickerStyle == 1) {
                this.majorPicker.container.innerHTML = '<div class="cdp-major-picker-gradient cdp-gradient-type-lr-colorful"><div class="cdp-major-picker-gradient cdp-gradient-type-bt-gray cdp-last-gradient-child"></div></div>';
                this.minorPicker.container.innerHTML = '<div class="cdp-minor-picker-gradient cdp-gradient-type-bt-white-current-color-black cdp-last-gradient-child"></div>';
                this.elm.pickerCurrentColorBackground = this.minorPicker.container.querySelector('.cdp-gradient-type-bt-white-current-color-black');
            }

            this.majorPicker.dragger = document.createElement('div');
            this.majorPicker.dragger.classList.add('cdp-major-dragger');
            this.majorPicker.container.querySelector('.cdp-last-gradient-child').appendChild(this.majorPicker.dragger);
            this.majorPicker.container.addEventListener('mousedown', function (e) {
                _this.pickerClicked(e, 'major');
            });
            this.majorPicker.container.addEventListener('touchstart', function (e) {
                _this.pickerClicked(e, 'major');
            });

            this.minorPicker.dragger = document.createElement('div');
            this.minorPicker.dragger.classList.add('cdp-minor-dragger');
            this.minorPicker.container.querySelector('.cdp-last-gradient-child').appendChild(this.minorPicker.dragger);
            this.minorPicker.container.addEventListener('mousedown', function (e) {
                _this.pickerClicked(e, 'minor');
            });
            this.minorPicker.container.addEventListener('touchstart', function (e) {
                _this.pickerClicked(e, 'minor');
            });

            // opacity picker
            if (this.allowOpacity) {
                this.opacityPicker.container = document.createElement('div');
                this.opacityPicker.container.classList.add('cdp-opacity-picker');
                this.opacityPicker.container.innerHTML = '<div class="cdp-opacity-picker-gradient cdp-background-type-opacity"><div class="cdp-opacity-picker-gradient cdp-gradient-type-bt-current-color cdp-last-gradient-child"><div class="cdp-opacity-dragger"></div></div></div>';
                pickerContainer.appendChild(this.opacityPicker.container);
                this.elm.pickerCurrentColorOpacityBackground = this.opacityPicker.container.querySelector('.cdp-gradient-type-bt-current-color');
                this.opacityPicker.dragger = this.opacityPicker.container.querySelector('.cdp-opacity-dragger');
                this.opacityPicker.container.addEventListener('mousedown', function (e) {
                    _this.pickerClicked(e, 'opacity');
                });
                this.opacityPicker.container.addEventListener('touchstart', function (e) {
                    _this.pickerClicked(e, 'opacity');
                });
            }

            // console
            if (this.allowClearColor || this.showColorValue || this.showButtons) {
                var consoleContainer = document.createElement('div');
                consoleContainer.classList.add('cdp-console-container');
                this.elm.picker.appendChild(consoleContainer);

                // color console
                if (this.allowClearColor || this.showColorValue) {
                    var colorConsoleContainer = document.createElement('div');
                    colorConsoleContainer.classList.add('cdp-color-console-container');
                    colorConsoleContainer.classList.add('cdp-background-type-opacity');
                    consoleContainer.appendChild(colorConsoleContainer);

                    this.elm.currentColorConsole = document.createElement('div');
                    this.elm.currentColorConsole.classList.add('cdp-current-color-console');
                    colorConsoleContainer.appendChild(this.elm.currentColorConsole);

                    if (this.showColorValue) {
                        this.elm.initialColor = document.createElement('div');
                        this.elm.initialColor.classList.add('cdp-initial-color');
                        this.elm.initialColor.innerHTML = '<i class="cdp-icons"></i>';
                        this.elm.initialColor.addEventListener('click', this.setColorWithInitialColor.bind(this));
                        colorConsoleContainer.insertBefore(this.elm.initialColor, this.elm.currentColorConsole);

                        this.elm.colorValueInput = document.createElement('input');
                        this.elm.colorValueInput.classList.add('cdp-current-color');
                        this.elm.colorValueInput.setAttribute('type', 'text');
                        this.elm.colorValueInput.setAttribute('spellcheck', false);
                        this.elm.colorValueInput.addEventListener('change', function () {
                            _this.setColorWithValue();
                        });
                        this.elm.currentColorConsole.appendChild(this.elm.colorValueInput);

                        this.elm.colorValueInput.value = this.color;
                        this.setInitialColorIcon();
                    } else {
                        consoleContainer.classList.add('cdp-current-color-non-showing');
                    }

                    if (this.allowClearColor) {
                        this.elm.clearColor = document.createElement('div');
                        this.elm.clearColor.classList.add('cdp-clear-color');
                        this.elm.clearColor.innerHTML = '<i class="cdp-icons"></i>';

                        this.elm.clearColor.addEventListener('click', function () {
                            _this.clearColor();
                        });
                        this.elm.currentColorConsole.appendChild(this.elm.clearColor);
                    } else {
                        consoleContainer.classList.add('cdp-clear-color-non-showing');
                    }
                } else {
                    consoleContainer.classList.add('cdp-color-console-non-showing');
                }

                // buttons
                if (this.showButtons) {
                    var buttonContainer = document.createElement('div');
                    buttonContainer.classList.add('cdp-button-container');
                    buttonContainer.innerHTML = '<div class="cdp-button" cdp-function="save"><i class="cdp-icons"></i>SAVE</div><div class="cdp-button" cdp-function="cancel"><i class="cdp-icons"></i>CANCEL</div>';
                    consoleContainer.appendChild(buttonContainer);

                    var saveButton = buttonContainer.querySelector('div[cdp-function="save"]');
                    var cancelButton = buttonContainer.querySelector('div[cdp-function="cancel"]');

                    saveButton.addEventListener('click', this.save.bind(this));
                    cancelButton.addEventListener('click', this.cancel.bind(this));
                }
            }

            // palette
            if (this.showPalette) {
                var arrowDiv = document.createElement('div');
                arrowDiv.classList.add('cdp-arrow-div');
                this.elm.picker.appendChild(arrowDiv);

                var arrowIcon = document.createElement('i');
                arrowIcon.classList.add('cdp-icons');
                arrowDiv.appendChild(arrowIcon);

                this.elm.paletteContainer = document.createElement('div');
                arrowIcon.addEventListener('click', function () {
                    _this.opacityToggle(_this.elm.paletteContainer);
                });

                this.elm.paletteContainer.classList.add('cdp-palette-container');
                this.elm.paletteContainer.classList.add('cdp-hidden');
                this.elm.paletteContainer.innerHTML = '<hr class="cdp-palette-line" /><div class="cdp-palette"></div>';
                this.elm.picker.appendChild(this.elm.paletteContainer);

                this.elm.palette = this.elm.picker.querySelector('.cdp-palette');

                if (this.allowPaletteAddColor) {
                    var addColor = document.createElement('div');
                    addColor.classList.add('cdp-palette-add-element');
                    addColor.innerHTML = '<i class="cdp-icons"></i>';
                    addColor.addEventListener('click', this.addColorToPalette.bind(this));
                    this.elm.palette.appendChild(addColor);
                }

                for (var i = 0; i < this.paletteColors.length; i++) {
                    var _getRgbaValue = this.getRgbaValue(this.paletteColors[i]),
                        r = _getRgbaValue.r,
                        g = _getRgbaValue.g,
                        b = _getRgbaValue.b,
                        a = _getRgbaValue.a;

                    this.paletteColors[i] = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
                    this.addColorElementToPalette({ r: r, g: g, b: b, a: a });
                }
            }

            if (this.color) {
                this.setColor(null, false, true, true);
            } else {
                this.clearColor(true);
            }
        }

        /**
         * Sets the color and the position of the picker on the palette and sets the input's value according to the new color.
         *
         * @param {Object} rgba
         * @param {Boolean} eventCall
         * @param {Boolean} input
         * @param {Boolean} picker
         */

    }, {
        key: 'setColor',
        value: function setColor(rgba, eventCall, input, picker) {
            var color, isDark;

            if (rgba) {
                color = this.convertColor(rgba);
                this.rgbaColor = rgba;
            }

            if (color && color.value != this.color || !rgba) {

                if (rgba) {
                    this.color = color.value;
                } else {
                    rgba = this.rgbaColor;
                }

                isDark = this.isDark(rgba);

                if (!this.embed) {
                    this.elm.overlay.style.background = this.color;
                }

                if (this.elm.currentColorConsole) {
                    this.elm.currentColorConsole.style.background = this.color;
                }

                if (isDark) {
                    if (this.pickerStyle == 0) {
                        this.majorPicker.dragger.classList.add('cdp-dark');
                    } else if (this.pickerStyle == 1) {
                        this.minorPicker.dragger.classList.add('cdp-dark');
                    }
                } else {
                    if (this.pickerStyle == 0) {
                        this.majorPicker.dragger.classList.remove('cdp-dark');
                    } else if (this.pickerStyle == 1) {
                        this.minorPicker.dragger.classList.remove('cdp-dark');
                    }
                }

                if (this.allowOpacity) {
                    if (isDark || rgba.a < 0.25) {
                        this.opacityPicker.dragger.classList.add('cdp-dark');
                    } else {
                        this.opacityPicker.dragger.classList.remove('cdp-dark');
                    }
                }

                if (this.showColorValue) {
                    if (input) {
                        this.elm.colorValueInput.value = this.color;
                    }

                    if (isDark || rgba.a < 0.4) {
                        this.elm.colorValueInput.classList.add('cdp-dark');
                    } else {
                        this.elm.colorValueInput.classList.remove('cdp-dark');
                    }
                }

                if (this.elm.clearColor) {
                    if (isDark || rgba.a < 0.4) {
                        this.elm.clearColor.classList.add('cdp-dark');
                    } else {
                        this.elm.clearColor.classList.remove('cdp-dark');
                    }
                }

                if (picker) {
                    var _rgba = rgba,
                        r = _rgba.r,
                        g = _rgba.g,
                        b = _rgba.b,
                        a = _rgba.a,
                        _rgbTohsl = this.rgbTohsl({ r: r, g: g, b: b }),
                        h = _rgbTohsl.h,
                        s = _rgbTohsl.s,
                        l = _rgbTohsl.l;

                    if (this.pickerStyle == 0) {
                        this.elm.pickerCurrentColorBackground.style.background = 'hsl(' + h + ', 100%, 50%)';

                        // major
                        var x = this.majorPicker.height,
                            maxColor = Math.max(r, g, b),
                            topCV = Math.abs(Math.round(x / 255 * maxColor - x)),
                            minColor = Math.min(r, g, b),
                            leftV = Math.abs(Math.round(x / 255 * minColor - x)),
                            leftCV = leftV - Math.abs(Math.round(topCV / maxColor * minColor));
                        this.majorPicker.dragger.style.left = leftCV - this.majorPicker.subtractedValue + 'px';
                        this.majorPicker.dragger.style.top = topCV - this.majorPicker.subtractedValue + 'px';

                        // minor
                        this.minorPicker.dragger.style.left = 'calc(50% - ' + this.minorPicker.subtractedValue + 'px)';
                        this.minorPicker.dragger.style.top = Math.round(this.minorPicker.height / 360 * h) - this.minorPicker.subtractedValue + 'px';

                        var rgb = this.getRgbaValue('hsl(' + h + ', 100%, 50%)');
                        this.rgbColor = rgb;
                    } else {
                        this.elm.pickerCurrentColorBackground.style.background = 'linear-gradient(to bottom, hsl(0, 100%, 100%), hsl(' + h + ', 100%, 50%), hsl(0,0%,0%))';

                        // major
                        var x = this.majorPicker.height,
                            leftCV = Math.round(x / 360 * h),
                            topCV = Math.abs(Math.round(x / 100 * s - x));
                        this.majorPicker.dragger.style.left = leftCV - this.majorPicker.subtractedValue + 'px';
                        this.majorPicker.dragger.style.top = topCV - this.majorPicker.subtractedValue + 'px';

                        // minor
                        this.minorPicker.dragger.style.left = 'calc(50% - ' + this.minorPicker.subtractedValue + 'px)';
                        var y = this.minorPicker.height;
                        this.minorPicker.dragger.style.top = Math.abs(Math.round(y / 100 * l - y)) - this.minorPicker.subtractedValue + 'px';

                        this.hslColor = {
                            h: h,
                            s: s,
                            l: l
                        };
                    }

                    if (this.allowOpacity) {
                        this.elm.pickerCurrentColorOpacityBackground.style.background = 'linear-gradient(to top, rgba(' + r + ', ' + g + ', ' + b + ', 1), rgba(' + r + ', ' + g + ', ' + b + ', 0))';
                        this.opacityPicker.dragger.style.left = 'calc(50% - ' + this.opacityPicker.subtractedValue + 'px)';
                        this.opacityPicker.dragger.style.top = Math.round(this.opacityPicker.height / 100 * (a * 100)) - this.opacityPicker.subtractedValue + 'px';
                    }
                }

                if (eventCall) {
                    this.el.dispatchEvent(events.changed);
                }
            }
        }

        /**
         * This function is called when a color is chosen using the picker.
         * Sets the color.
         *
         * @param {Object} event
         * @param {String} type
         */

    }, {
        key: 'pickerClicked',
        value: function pickerClicked(event, type) {
            this.dragStatus = type;
            document.body.classList.add('cdp-dragging-active');

            if (type == 'major' && this.pickerStyle == 0 && !this.color) {
                this.setColorWithPosition({ x: this.minorPicker.dragger.offsetLeft + this.minorPicker.subtractedValue, y: this.minorPicker.dragger.offsetTop + this.minorPicker.subtractedValue }, 'minor');
            } else if (type == 'minor' && this.pickerStyle == 1 && !this.color) {
                this.setColorWithPosition({ x: this.majorPicker.dragger.offsetLeft + this.majorPicker.subtractedValue, y: this.majorPicker.dragger.offsetTop + this.majorPicker.subtractedValue }, 'major');
            } else if (type == 'opacity' && !this.color) {
                if (this.pickerStyle == 0) {
                    this.setColorWithPosition({ x: this.minorPicker.dragger.offsetLeft + this.minorPicker.subtractedValue, y: this.minorPicker.dragger.offsetTop + this.minorPicker.subtractedValue }, 'minor');
                } else {
                    this.setColorWithPosition({ x: this.majorPicker.dragger.offsetLeft + this.majorPicker.subtractedValue, y: this.majorPicker.dragger.offsetTop + this.majorPicker.subtractedValue }, 'major');
                }
            }

            this.pickerMoved(event);
            this.toggleDraggerListeners(true);
        }

        /**
         * This function is called when the picker is moved on the palette. Takes the event object as an argument. Calls the setColorWithPosition() to set the new color.
         *
         * @param {Object} event
         */

    }, {
        key: 'pickerMoved',
        value: function pickerMoved(event) {
            var n;

            if (this.dragStatus == 'major') {
                n = this.newPosition(event, this.majorPicker);
            } else if (this.dragStatus == 'minor') {
                n = this.newPosition(event, this.minorPicker);
            } else {
                n = this.newPosition(event, this.opacityPicker);
            }
            this.setColorWithPosition(n, this.dragStatus, true);

            event.preventDefault();
        }

        /**
         * Sets and returns the new position of the picker.
         *
         * @param {Object} event
         * @param {Object} picker
         * @returns {x: Number, y: Number}
         */

    }, {
        key: 'newPosition',
        value: function newPosition(event, picker) {
            var rect = picker.container.getBoundingClientRect(),
                eX = event.clientX ? event.clientX : event.pageX - window.pageXOffset,
                eY = event.clientY ? event.clientY : event.pageY - window.pageYOffset,
                x = eX - (rect.left + picker.subtractedValue),
                y = eY - (rect.top + picker.subtractedValue);

            if (x < -picker.subtractedValue) {
                x = -picker.subtractedValue;
            } else if (x > picker.width - picker.subtractedValue) {
                x = picker.width - picker.subtractedValue;
            }
            if (y < -picker.subtractedValue) {
                y = -picker.subtractedValue;
            } else if (y > picker.height - picker.subtractedValue) {
                y = picker.height - picker.subtractedValue;
            }

            picker.dragger.style.left = x + 'px';
            picker.dragger.style.top = y + 'px';
            return { x: x + picker.subtractedValue, y: y + picker.subtractedValue };
        }

        /**
         * Sets the color according to the new position.
         *
         * @param {Object} n
         * @param {String} type
         * @param {Boolean} eventCall
         */

    }, {
        key: 'setColorWithPosition',
        value: function setColorWithPosition(n, type) {
            var eventCall = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            if (type == 'major') {
                if (this.pickerStyle == 0) {
                    var rgb = [this.rgbColor.r, this.rgbColor.g, this.rgbColor.b],
                        x = this.majorPicker.height,
                        topCV,
                        leftV,
                        leftCV,
                        netV;

                    for (var i = 0; i < rgb.length; i++) {
                        var v = rgb[i];
                        if (v == 255) {
                            netV = Math.abs(Math.round(255 / x * n.y - 255));
                        } else {
                            topCV = Math.round((x - n.y) * (v / x));
                            leftV = Math.round((x - n.x) * ((255 - v) / x));
                            leftCV = Math.abs(Math.round((x - n.y) * (leftV / x)));
                            netV = topCV + leftCV;
                        }
                        rgb[i] = netV;
                    }

                    var r = rgb[0],
                        g = rgb[1],
                        b = rgb[2];

                    this.setColor({
                        r: r,
                        g: g,
                        b: b,
                        a: this.rgbaColor.a
                    }, eventCall, true, false);

                    if (this.allowOpacity) {
                        this.elm.pickerCurrentColorOpacityBackground.style.background = 'linear-gradient(to top, rgba(' + r + ', ' + g + ', ' + b + ', 1), rgba(' + r + ', ' + g + ', ' + b + ', 0))';
                    }
                } else if (this.pickerStyle == 1) {
                    var x = this.majorPicker.height,
                        h = Math.round(n.x * (360 / x)),
                        s = Math.abs(Math.round(n.y * (100 / x)) - 100);

                    this.elm.pickerCurrentColorBackground.style.background = 'linear-gradient(to bottom, hsl(0, 100%, 100%), hsl(' + h + ', ' + s + '%, 50%), hsl(0, 0%, 0%))';
                    this.hslColor.h = h;
                    this.hslColor.s = s;

                    var minorX = this.minorPicker.dragger.offsetLeft + this.minorPicker.subtractedValue,
                        minorY = this.minorPicker.dragger.offsetTop + this.minorPicker.subtractedValue;

                    this.setColorWithPosition({ x: minorX, y: minorY }, 'minor', eventCall);
                }
            } else if (type == 'minor') {
                if (this.pickerStyle == 0) {
                    var x = this.minorPicker.height,
                        h = Math.round(n.y * (360 / x));

                    this.elm.pickerCurrentColorBackground.style.background = 'hsl(' + h + ', 100%, 50%)';
                    var rgb = this.getRgbaValue('hsl(' + h + ', 100%, 50%)');
                    this.rgbColor = rgb;

                    var majorX = this.majorPicker.dragger.offsetLeft + this.majorPicker.subtractedValue,
                        majorY = this.majorPicker.dragger.offsetTop + this.majorPicker.subtractedValue;

                    this.setColorWithPosition({ x: majorX, y: majorY }, 'major', eventCall);
                } else if (this.pickerStyle == 1) {
                    var x = this.minorPicker.height,
                        l = Math.abs(Math.round(n.y * (100 / x)) - 100);
                    this.hslColor.l = l;

                    var _getRgbaValue2 = this.getRgbaValue('hsl(' + this.hslColor.h + ', ' + this.hslColor.s + '%, ' + this.hslColor.l + '%)'),
                        r = _getRgbaValue2.r,
                        g = _getRgbaValue2.g,
                        b = _getRgbaValue2.b;

                    this.setColor({
                        r: r,
                        g: g,
                        b: b,
                        a: this.rgbaColor.a
                    }, eventCall, true, false);

                    if (this.allowOpacity) {
                        this.elm.pickerCurrentColorOpacityBackground.style.background = 'linear-gradient(to top, rgba(' + r + ', ' + g + ', ' + b + ', 1), rgba(' + r + ', ' + g + ', ' + b + ', 0))';
                    }
                }
            } else if (type == 'opacity') {
                var _rgbaColor = this.rgbaColor,
                    r = _rgbaColor.r,
                    g = _rgbaColor.g,
                    b = _rgbaColor.b,
                    a;


                var x = this.opacityPicker.height;
                a = Math.round(100 / x * n.y) / 100;

                this.setColor({
                    r: r,
                    g: g,
                    b: b,
                    a: a
                }, eventCall, true, false);
            }
        }

        /**
         * Ends the dragging.
         */

    }, {
        key: 'pickerReleased',
        value: function pickerReleased() {
            document.body.classList.remove('cdp-dragging-active');
            this.toggleDraggerListeners(false);
        }

        /**
         * Toggles dragger listeners according to status.
         *
         * @param {Boolean} status
         */

    }, {
        key: 'toggleDraggerListeners',
        value: function toggleDraggerListeners(status) {
            if (status) {
                document.addEventListener('mousemove', this.pickerMovedBind);
                document.addEventListener('touchmove', this.pickerMovedBind);
                document.addEventListener('mouseup', this.pickerReleasedBind);
                document.addEventListener('touchend', this.pickerReleasedBind);
            } else {
                document.removeEventListener('mousemove', this.pickerMovedBind);
                document.removeEventListener('touchmove', this.pickerMovedBind);
                document.removeEventListener('mouseup', this.pickerReleasedBind);
                document.removeEventListener('touchend', this.pickerReleasedBind);
            }
        }

        /**
         * This function is called when the input's value is changed.
         * Sets the new color.
         */

    }, {
        key: 'setColorWithValue',
        value: function setColorWithValue() {
            var value = this.elm.colorValueInput.value;
            if (value.trim() && value != this.color) {
                var rgba = this.getRgbaValue(value);
                this.setColor(rgba, true, false, true);
            }
        }

        /**
         *  Sets the initial color as current color.
         */

    }, {
        key: 'setColorWithInitialColor',
        value: function setColorWithInitialColor() {
            if (this.initialColor != this.color) {
                if (this.initialColor) {
                    var rgba = this.getRgbaValue(this.initialColor);
                    this.setColor(rgba, true, true, true);
                } else {
                    this.clearColor();
                }
            }
        }

        /**
         * Clears the color.
         *
         * @param {Boolean} pass
         */

    }, {
        key: 'clearColor',
        value: function clearColor() {
            var pass = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            if (this.color || pass) {
                this.majorPicker.dragger.style.left = this.majorPicker.subtractedValue * -1 + 'px';
                this.majorPicker.dragger.style.top = this.majorPicker.subtractedValue * -1 + 'px';
                this.minorPicker.dragger.style.left = 'calc(50% - ' + this.minorPicker.subtractedValue + 'px)';
                this.minorPicker.dragger.style.top = this.minorPicker.subtractedValue * -1 + 'px';

                this.rgbaColor.a = 1;

                if (this.pickerStyle == 0) {
                    this.elm.pickerCurrentColorBackground.style.background = 'hsl(0,100%,50%)';
                    this.majorPicker.dragger.classList.add('cdp-dark');
                } else if (this.pickerStyle == 1) {
                    this.elm.pickerCurrentColorBackground.style.background = 'linear-gradient(to bottom, hsl(0,100%,100%), hsl(0,100%,50%), hsl(0,0%,0%))';
                    this.minorPicker.dragger.classList.add('cdp-dark');
                }

                if (this.allowOpacity) {
                    this.elm.pickerCurrentColorOpacityBackground.style.background = 'linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))';
                    this.opacityPicker.dragger.style.left = 'calc(50% - ' + this.opacityPicker.subtractedValue + 'px)';
                    this.opacityPicker.dragger.style.top = this.opacityPicker.height - this.opacityPicker.subtractedValue + 'px';
                    this.opacityPicker.dragger.classList.add('cdp-dark');
                }

                if (this.showColorValue) {
                    this.elm.colorValueInput.value = '';
                    this.elm.colorValueInput.classList.add('cdp-dark');
                }
                this.elm.currentColorConsole.style.background = 'transparent';
                this.elm.clearColor.classList.add('cdp-dark');

                if (!this.embed) {
                    this.elm.overlay.style.background = 'transparent';
                }

                if (!pass) {
                    this.color = null;
                    this.el.dispatchEvent(events.changed);
                }
            }
        }

        // palette
        /**
         * Adds a color element to the palette.
         *
         * @param {Object} rgba
         */

    }, {
        key: 'addColorElementToPalette',
        value: function addColorElementToPalette(rgba) {
            var _this2 = this;

            var r = rgba.r,
                g = rgba.g,
                b = rgba.b,
                a = rgba.a,
                color = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')',
                paletteElement = document.createElement('div');

            paletteElement.classList.add('cdp-palette-element');
            paletteElement.classList.add('cdp-background-type-opacity');
            paletteElement.innerHTML = '<div style="background:' + color + ';"></div>';
            paletteElement.addEventListener('click', function () {
                _this2.setColorFromPalette(rgba);
            });
            this.elm.palette.appendChild(paletteElement);
        }

        /**
        * Adds a color to the palette.
        */

    }, {
        key: 'addColorToPalette',
        value: function addColorToPalette() {
            var _rgbaColor2 = this.rgbaColor,
                r = _rgbaColor2.r,
                g = _rgbaColor2.g,
                b = _rgbaColor2.b,
                a = _rgbaColor2.a,
                color = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';


            if (this.color && this.paletteColors.indexOf(color) == -1) {
                this.paletteColors.push(color);
                this.addColorElementToPalette(this.rgbaColor);
            }
        }

        /**
         * Sets the selected color as current color.
         *
         * @param {Object} rgba
         */

    }, {
        key: 'setColorFromPalette',
        value: function setColorFromPalette(rgba) {
            this.setColor(rgba, true, true, true);
        }

        /**
         *  Sets the color of the icon of initial color according to initial color.
         */

    }, {
        key: 'setInitialColorIcon',
        value: function setInitialColorIcon() {
            if (!this.initialColor) {
                this.elm.initialColor.style.background = 'transparent';
                this.elm.initialColor.classList.add('cdp-dark');
            } else {
                this.elm.initialColor.style.background = this.initialColor;

                var rgba = this.getRgbaValue(this.initialColor),
                    isDark = this.isDark(rgba);

                if (isDark || rgba.a < 0.4) {
                    this.elm.initialColor.classList.add('cdp-dark');
                } else {
                    this.elm.initialColor.classList.remove('cdp-dark');
                }
            }
        }

        /**
         * Checks if a color is dark or not.
         *
         * @param {Object} rgb
         * @returns {Boolean}
         */

    }, {
        key: 'isDark',
        value: function isDark(rgb) {
            var r = rgb.r,
                g = rgb.g,
                b = rgb.b,
                dark = Math.round((r * 299 + g * 587 + b * 114) / 1000);


            return dark > 125 ? true : false;
        }

        /**
         * Shows or hides the given element with opacity animation.
         *
         * @param {HTML Element} elm
         * @param {String} c
         * @returns {Promise<void>}
         */

    }, {
        key: 'opacityToggle',
        value: function opacityToggle(elm, c) {
            return new Promise(function (resolve) {
                if (!c) {
                    if (elm.classList.contains('cdp-hidden')) {
                        c = 'appear';
                    } else {
                        c = 'leave';
                    }
                }

                var style = elm.getAttribute('style') ? elm.getAttribute('style').replace(/opacity[^;]+;?/g, '') : null,
                    start = null,
                    duration = 100;

                if (c == 'appear') {
                    elm.classList.remove('cdp-hidden');
                    elm.style.opacity = 0;
                } else {
                    elm.style.opacity = 1;
                }

                function opacityAnimation(timestamp) {
                    if (!start) {
                        start = timestamp || new Date.getTime();
                    }

                    var runtime = timestamp - start,
                        progress = runtime / duration;
                    progress = Math.min(progress, 1);

                    if (runtime < duration) {
                        var value = progress;
                        if (c == 'leave') {
                            value = Math.abs(progress - 1);
                        }
                        elm.style.opacity = value;
                        window.requestAnimationFrame(opacityAnimation);
                    } else {
                        if (c == 'leave') {
                            elm.classList.add('cdp-hidden');
                        }
                        elm.setAttribute('style', style);

                        resolve();
                    }
                }
                window.requestAnimationFrame(opacityAnimation);
            });
        }

        /**
         * Shows the color picker.
         */

    }, {
        key: 'openPicker',
        value: function openPicker() {
            var _this3 = this;

            if (this.elm.picker.classList.contains('cdp-hidden') && !this.animationProcessing) {
                this.animationProcessing = true;

                if (!this.embed) {
                    this.elm.picker.classList.add('cdp-visibility-hidden');
                    this.setPosition();
                    this.elm.picker.classList.remove('cdp-visibility-hidden');
                }

                this.opacityToggle(this.elm.picker, 'appear').then(function () {
                    _this3.animationProcessing = false;
                });

                if (!this.embed) {
                    window.addEventListener('resize', this.setPositionBind, true);

                    if (!this.showButtons) {
                        document.addEventListener('mousedown', this.closePickerBind, true);
                        document.addEventListener('touchstart', this.closePickerBind, true);
                    }
                }

                this.el.dispatchEvent(events.open);
            }
        }

        /**
         * Hides the picker if the click target is not the picker itself.
         *
         * @param {Object} event
         * @param {Boolean} pass
         */

    }, {
        key: 'closePicker',
        value: function closePicker(event) {
            var _this4 = this;

            var pass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if ((event && !this.elm.picker.contains(event.target) || pass) && !this.animationProcessing) {
                this.animationProcessing = true;

                this.opacityToggle(this.elm.picker, 'leave').then(function () {
                    _this4.animationProcessing = false;
                });

                if (!this.embed) {
                    window.removeEventListener('resize', this.setPositionBind, true);

                    if (!this.showButtons) {
                        document.removeEventListener('mousedown', this.closePickerBind, true);
                        document.removeEventListener('touchstart', this.closePickerBind, true);
                    }
                }

                this.el.dispatchEvent(events.close);
            }
        }

        /**
         * Sets the picker's position.
         */

    }, {
        key: 'setPosition',
        value: function setPosition() {
            var rect = this.elm.main.getBoundingClientRect(),
                left = rect.left + window.pageXOffset,
                top = rect.top + window.pageYOffset,
                x = left + this.elm.picker.offsetWidth + 10,
                _x = left - this.elm.picker.offsetWidth,
                y = top + this.elm.picker.offsetHeight + 40,
                _y = top - (this.elm.picker.offsetHeight + 10),
                w = window.innerWidth + window.pageXOffset,
                h = window.innerHeight + window.pageYOffset;

            if (x >= w && _x > 0) {
                this.elm.picker.classList.add('cdp-right');
            } else {
                this.elm.picker.classList.remove('cdp-right');
            }

            if (y >= h && _y > 0) {
                this.elm.picker.classList.add('cdp-bottom');
            } else {
                this.elm.picker.classList.remove('cdp-bottom');
            }
        }

        /**
         * Returns the current color.
         *
         * @returns {Object}
         */

    }, {
        key: 'get',
        value: function get$$1() {
            return !this.color ? { value: null } : this.convertColor(this.rgbaColor);
        }

        /**
         * Sets a new color.
         *
         * @param {String} newColor
         */

    }, {
        key: 'set',
        value: function set$$1(newColor) {
            if (!newColor && this.allowClearColor) {
                this.clearColor();
            } else if (!newColor) {
                newColor = this.color;
            } else {
                var rgba = this.getRgbaValue(newColor);
                this.setColor(rgba, true, true, true);
            }
        }

        /**
         * Shows the picker.
         */

    }, {
        key: 'show',
        value: function show() {
            this.openPicker();
        }

        /**
         * Hides the picker.
         */

    }, {
        key: 'hide',
        value: function hide() {
            if (!this.elm.picker.classList.contains('cdp-hidden')) {
                this.closePicker(null, true);
            }
        }

        /**
        * Sets current color as initial color and fires the save event.
        */

    }, {
        key: 'save',
        value: function save() {
            this.initialColor = this.color;

            if (this.showColorValue) {
                this.setInitialColorIcon();
            }

            if (!this.embed) {
                this.hide();
            }

            this.el.dispatchEvent(events.save);
        }

        /**
         * Sets initial color as current color and fires the cancel event.
         */

    }, {
        key: 'cancel',
        value: function cancel() {
            this.setColorWithInitialColor();

            if (!this.embed) {
                this.hide();
            }

            this.el.dispatchEvent(events.cancel);
        }

        /**
         * Converts any color type to RGBA with getComputedStyle.
         *
         * @param {String} color
         * @returns {Object}
         */

    }, {
        key: 'getRgbaValue',
        value: function getRgbaValue(color) {
            this.elm.rgbaColor.style.background = color;

            var backgroundValue = window.getComputedStyle(this.elm.rgbaColor, false, null).getPropertyValue('background-color'),
                rgba = backgroundValue.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');

            return {
                r: parseInt(rgba[0]),
                g: parseInt(rgba[1]),
                b: parseInt(rgba[2]),
                a: rgba[3] ? parseFloat(rgba[3]) : 1
            };
        }

        /**
         * Converts and returns the current color according to the selected format that user chose.
         *
         * @param {Object} rgba
         * @returns {Object}
         */

    }, {
        key: 'convertColor',
        value: function convertColor(rgba) {
            var r = rgba.r,
                g = rgba.g,
                b = rgba.b,
                a = rgba.a;


            if (a == 1 || !this.allowOpacity) {
                if (this.colorFormat == 'hex') {
                    return { value: this.rgbTohex({ r: r, g: g, b: b }) };
                } else if (this.colorFormat == 'rgb') {
                    return { value: 'rgb(' + r + ', ' + g + ', ' + b + ')', r: r, g: g, b: b };
                } else if (this.colorFormat == 'rgba') {
                    return { value: 'rgba(' + r + ', ' + g + ', ' + b + ', 1)', r: r, g: g, b: b, a: 1 };
                } else {
                    var _rgbTohsl2 = this.rgbTohsl({ r: r, g: g, b: b }),
                        h = _rgbTohsl2.h,
                        s = _rgbTohsl2.s,
                        l = _rgbTohsl2.l;

                    if (this.colorFormat == 'hsl') {
                        return { value: 'hsl(' + h + ', ' + s + '%, ' + l + '%)', h: h, s: s, l: l };
                    } else {
                        return { value: 'hsla(' + h + ', ' + s + '%, ' + l + '%, 1)', h: h, s: s, l: l, a: 1 };
                    }
                }
            } else {
                if (this.colorFormat != 'hsl' && this.colorFormat != 'hsla') {
                    return { value: 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')', r: r, g: g, b: b, a: a };
                } else {
                    var _rgbTohsl3 = this.rgbTohsl({ r: r, g: g, b: b }),
                        h = _rgbTohsl3.h,
                        s = _rgbTohsl3.s,
                        l = _rgbTohsl3.l;

                    return { value: 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')', h: h, s: s, l: l, a: a };
                }
            }
        }

        /**
         * Converts RGB value to HEX.
         *
         * @param {Object} rgb
         * @returns {String}
         */

    }, {
        key: 'rgbTohex',
        value: function rgbTohex(rgb) {
            var hex = '#' + ('0' + parseInt(rgb.r, 10).toString(16)).slice(-2) + ('0' + parseInt(rgb.g, 10).toString(16)).slice(-2) + ('0' + parseInt(rgb.b, 10).toString(16)).slice(-2);

            return hex.toUpperCase();
        }

        /**
         * Converts RGB value to HSL.
         *
         * @param {Object} rgb
         * @returns {Object}
         */

    }, {
        key: 'rgbTohsl',
        value: function rgbTohsl(rgb) {
            var r = rgb.r / 255,
                g = rgb.g / 255,
                b = rgb.b / 255;
            var maxColor = Math.max(r, g, b);
            var minColor = Math.min(r, g, b);
            // calculate L:
            var l = (maxColor + minColor) / 2;
            var s = 0;
            var h = 0;
            if (maxColor != minColor) {
                // calculate S:
                if (l < 0.5) {
                    s = (maxColor - minColor) / (maxColor + minColor);
                } else {
                    s = (maxColor - minColor) / (2.0 - maxColor - minColor);
                }
                // calculate h:
                if (r == maxColor) {
                    h = (g - b) / (maxColor - minColor);
                } else if (g == maxColor) {
                    h = 2.0 + (b - r) / (maxColor - minColor);
                } else {
                    h = 4.0 + (r - g) / (maxColor - minColor);
                }
            }

            l = Math.round(l * 100);
            s = Math.round(s * 100);
            h = Math.round(h * 60);
            if (h < 0) {
                h += 360;
            }

            return { h: h, s: s, l: l };
        }
    }]);
    return Cordelia;
}();

export default Cordelia;
