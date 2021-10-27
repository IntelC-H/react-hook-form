import { Noop } from '../types';

export type Observer<T> = {
  next: (value: T) => void;
};

export type TearDown = Noop;

export type Subscription = {
  add: (tearDown: TearDown) => void;
  unsubscribe: () => void;
};

export type Subject<T> = {
  readonly observers: Observer<T>[];
  next: (value: T) => void;
  subscribe: (value: Observer<T>) => {
    unsubscribe: TearDown;
  };
  unsubscribe: Noop;
};

function createSubscription() {
  let tearDowns: TearDown[] = [];

  const add = (tearDown: TearDown) => {
    tearDowns.push(tearDown);
  };

  const unsubscribe = () => {
    for (const teardown of tearDowns) {
      teardown();
    }
    tearDowns = [];
  };

  return {
    add,
    unsubscribe,
  };
}

function createSubscriber<T>(
  observer: Observer<T>,
  subscription: Subscription,
): Observer<T> {
  let closed = false;
  subscription.add(() => (closed = true));

  const next = (value: T) => {
    if (!closed) {
      observer.next(value);
    }
  };

  return {
    next,
  };
}

export default function createSubject<T>(): Subject<T> {
  let _observers: Observer<T>[] = [];

  const next = (value: T) => {
    for (const observer of _observers) {
      observer.next(value);
    }
  };

  const subscribe = (observer: Observer<T>) => {
    const subscription = createSubscription();
    const subscriber = createSubscriber(observer, subscription);
    _observers.push(subscriber);
    return subscription;
  };

  const unsubscribe = () => {
    _observers = [];
  };

  return {
    get observers() {
      return _observers;
    },
    next,
    subscribe,
    unsubscribe,
  };
}
