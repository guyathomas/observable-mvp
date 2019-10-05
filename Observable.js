class Observable {

  constructor(subscribe) {
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }

  static create(subscribe) => {
    return new Observable(subscribe);
  }

  subscribe(observerOrNext, error, complete) {
    const { operator } = this;
    const sink = toSubscriber(observerOrNext, error, complete);

    if (operator) {
      sink.add(operator.call(sink, this.source));
    } else {
      sink.add(
        this.source || (config.useDeprecatedSynchronousErrorHandling && !sink.syncErrorThrowable) ?
        this._subscribe(sink) :
        this._trySubscribe(sink)
      );
    }

    if (config.useDeprecatedSynchronousErrorHandling) {
      if (sink.syncErrorThrowable) {
        sink.syncErrorThrowable = false;
        if (sink.syncErrorThrown) {
          throw sink.syncErrorValue;
        }
      }
    }

    return sink;
  }

  /** @deprecated This is an internal implementation detail, do not use. */
  _trySubscribe(sink){
    try {
      return this._subscribe(sink);
    } catch (err) {
      if (config.useDeprecatedSynchronousErrorHandling) {
        sink.syncErrorThrown = true;
        sink.syncErrorValue = err;
      }
      if (canReportError(sink)) {
        sink.error(err);
      } else {
        console.warn(err);
      }
    }
  }

  forEach(next) {
    return new Promise((resolve, reject) => {
      let subscription = this.subscribe((value) => {
        try {
          next(value);
        } catch (err) {
          reject(err);
          if (subscription) {
            subscription.unsubscribe();
          }
        }
      }, reject, resolve);
    }) as Promise<void>;
  }

  _subscribe(subscriber){
    const { source } = this;
    return source && source.subscribe(subscriber);
  }

  
  pipe(...operations) {
    if (operations.length === 0) {
      return this;
    }
    // TODO: Include this
    // return pipeFromArray(operations)(this);
  }
}

function toSubscriber(nextOrObserver, error, complete){
  if (nextOrObserver) {
    if (nextOrObserver instanceof Subscriber) {
      return (<Subscriber<T>> nextOrObserver);
    }

    if (nextOrObserver[rxSubscriberSymbol]) {
      return nextOrObserver[rxSubscriberSymbol]();
    }
  }

  if (!nextOrObserver && !error && !complete) {
    return new Subscriber(emptyObserver);
  }

  return new Subscriber(nextOrObserver, error, complete);
}

