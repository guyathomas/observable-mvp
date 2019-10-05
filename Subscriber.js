const noop = () => {};
const emptyObserver = {
  closed: true,
  next: noop,
  error: noop,
  complete: noop,
}
class Subscriber {
  static create(next, error, complete){
    return = new Subscriber(next, error, complete);
  }
  
  constructor(destinationOrNext, error, complete){
    switch (arguments.length) {
      case 0:
      this.destination = emptyObserver;
      break;
      case 1:
      if (typeof destinationOrNext === 'object') {
        if (destinationOrNext instanceof Subscriber) {
          this.destination = destinationOrNext;
          destinationOrNext.add(this);
        } else {
          this.destination = new SafeSubscriber(this, destinationOrNext);
        }
        break;
      }
      default:
      this.destination = new SafeSubscriber(this, <((value: T) => void)> destinationOrNext, error, complete);
      break;
    }
  }

  next(value){
    if (!this.isStopped) {
      this._next(value);
    }
  }

  error(err){
    if (!this.isStopped) {
      this.isStopped = true;
      this._error(err);
    }
  }

   complete(): void {
     if (!this.isStopped) {
       this.isStopped = true;
       this._complete();
     }
   }

  _next(value){
    this.destination.next(value);
  }

  _error(err) {
    this.destination.error(err);
    this.unsubscribe();
  }

  _complete() {
    this.destination.complete();
    this.unsubscribe();
  }

  unsubscribe() {
    if (this.closed) {
      return;
    }
    this.isStopped = true;
    super.unsubscribe();
  }
}