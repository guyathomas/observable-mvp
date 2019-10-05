// This is the full implementation
class ObjectUnsubscribedError extends Error {
    constructor(message) {
    super(message);
    this.name = "ObjectUnsubscribedError";
  }
}

class Subject {
  constructor() {
    this.observers = [];
    this.closed =  false;
    this.isStopped = false;
    this.hasError = false;
    this.thrownError = null;
  }

    next(value) {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    if (!this.isStopped) {
      const { observers } = this;
      const len = observers.length;
      const copy = observers.slice();
      for (let i = 0; i < len; i++) {
        copy[i].next(value);
      }
    }
  }

    error(err) {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    this.hasError = true;
    this.thrownError = err;
    this.isStopped = true;
    const { observers } = this;
    const len = observers.length;
    const copy = observers.slice();
    for (let i = 0; i < len; i++) {
      copy[i].error(err);
    }
    this.observers.length = 0;
  }

    complete() {
      if (this.closed) {
        throw new ObjectUnsubscribedError();
      }
      this.isStopped = true;
      const { observers } = this;
      const len = observers.length;
      const copy = observers.slice();
      for (let i = 0; i < len; i++) {
        copy[i].complete();
      }
      this.observers.length = 0;
    }

  unsubscribe() {
    this.isStopped = true;
    this.closed = true;
    this.observers = null;
  }
}

