/**
 * WideHardo yoinked from https://github.com/primus/eventemitter3/blob/master/index.d.ts
 */

type ObjectKey = string | symbol;


/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @private
 */
class Events {

}

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @private
 */
class EE {
  constructor(public fn: Function, public context: unknown, public once = false) {}
}


/**
 * Um... ahactually this is Array | {...}
 */
type RegisteredEvents = Array<EE> & EE;

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @public
 */
export class EventEmitter<EventTypes extends ValidEventTypes = string | symbol, Context extends any = any> {
  private _events: {[x in ObjectKey]: RegisteredEvents} = {};
  private _eventsCount = 0;

  /**
   * Return an array listing the events for which the emitter has registered
   * listeners.
   *
   * @returns {Array}
   * @public
   */
  eventNames(): Array<EventNames<EventTypes>> {
    if (this._eventsCount === 0) return [];
    return (Object.keys(this._events) as Array<any>)
      .concat(Object.getOwnPropertySymbols(this._events));
  }

  /**
   * Clear event by name.
   *
   * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
   * @param {(String|Symbol)} evt The Event name.
   * @private
   */
  clearEvent(evt: ObjectKey) {
    if (--this._eventsCount === 0) this._events = {};
    // @ts-expect-error -- https://github.com/microsoft/TypeScript/issues/1863
    else delete this._events[evt];
  }

  /**
   * Return the listeners registered for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Array} The registered listeners.
   * @public
   */
  listeners<T extends EventNames<EventTypes>>(event: T): Array<EventListener<EventTypes, T>> {
    const handlers = this._events[event];

    if (!handlers) return [];
    if (handlers.fn) return [handlers.fn as EventListener<EventTypes, T>];

    return handlers.map(x => x.fn) as Array<EventListener<EventTypes, T>>;
  }

  /**
   * Return the number of listeners listening to a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Number} The number of listeners.
   * @public
   */
  listenerCount(event: EventNames<EventTypes>): number {
    const listeners = this._events[event];

    if (!listeners) return 0;
    if (listeners.fn) return 1;
    return listeners.length;
  }

  /**
   * Calls each of the listeners registered for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param args
   * @returns {Boolean} `true` if the event had listeners, else `false`.
   * @public
   */
  emit<T extends EventNames<EventTypes>>(event: T, ...args: EventArgs<EventTypes, T>): boolean {
    if (!this._events[event]) return false;

    const listeners = this._events[event];

    if (listeners.fn) {
      if (listeners.once) this.removeListener(event, listeners.fn as any, undefined, true);
      listeners.fn.apply(listeners.context, args);
    } else {
      const length = listeners.length

      for (let i = 0; i < length; i++) {
        if (listeners[i].once) this.removeListener(event, listeners[i].fn as any, undefined, true);
        listeners[i].fn!.apply(listeners[i].context, args);
      }
    }
    return true;
  }

  /**
   * Add a listener for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} context The context to invoke the listener with.
   * @param {Boolean} once Specify if the listener is a one-time listener.
   * @returns {EventEmitter}
   * @private
   */
  private _addListener<T extends EventNames<EventTypes>>(
    event: T,
    fn: EventListener<EventTypes, T>,
    context: Context, once: boolean) {
    if (typeof fn !== 'function') {
      throw new TypeError('The listener must be a function');
    }

    const listener = new EE(fn, context || this, once)
    const evt = event;

    if (!this._events[evt]) {
      this._events[evt] = listener as RegisteredEvents;
      this._eventsCount++;
    }
    else if (!this._events[evt].fn) {
      this._events[evt].push(listener);
    }
    else {
      this._events[evt] = [this._events[evt], listener] as RegisteredEvents;
    }

    return this;
  }

  /**
   * Add a listener for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} [context=this] The context to invoke the listener with.
   * @returns {EventEmitter} `this`.
   * @public
   */
  on<T extends EventNames<EventTypes>>(
    event: T,
    fn: EventListener<EventTypes, T>,
    context?: Context)
  {
    return this._addListener(event, fn, context as Context, false);
  }

  /**
   * Add a one-time listener for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} [context=this] The context to invoke the listener with.
   * @returns {EventEmitter} `this`.
   * @public
   */
  once<T extends EventNames<EventTypes>>(
    event: T,
    fn: EventListener<EventTypes, T>,
    context?: Context)
  {
    return this._addListener(event, fn, context as Context, true);
  }

  /**
   * Remove the listeners of a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn Only remove the listeners that match this function.
   * @param {*} context Only remove the listeners that have this context.
   * @param {Boolean} once Only remove one-time listeners.
   * @returns {EventEmitter} `this`.
   * @public
   */
  removeListener<T extends EventNames<EventTypes>>(
    event: T,
    fn: EventListener<EventTypes, T>,
    context?: Context,
    once?: boolean) {
    const evt = event;

    if (!this._events[evt]) return this;
    if (!fn) {
      this.clearEvent(evt);
      return this;
    }

    const listeners: RegisteredEvents = this._events[evt];

    if (listeners.fn) {
      if (
        listeners.fn === fn &&
        (!once || listeners.once) &&
        (!context || listeners.context === context)
      ) {
        this.clearEvent(evt);
      }
    } else {
      const events: EE[] = [];
      for (let i = 0, length = listeners.length; i < length; i++) {
        if (
          listeners[i].fn !== fn ||
          (once && !listeners[i].once) ||
          (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }

      //
      // Reset the array, or remove it completely if we have no more listeners.
      //
      if (events.length)
        this._events[evt] = (events.length === 1 ? events[0] : events) as RegisteredEvents;
      else this.clearEvent(evt);
    }

    return this;
  }

  /**
   * Remove all listeners, or those of the specified event.
   *
   * @param {(String|Symbol)} [event] The event name.
   * @returns {EventEmitter} `this`.
   * @public
   */
  removeAllListeners(event: EventNames<EventTypes>): this {

    if (event) {
      const evt = event;
      if (this._events[evt]) this.clearEvent(evt);
    } else {
      this._events = {};
      this._eventsCount = 0;
    }

    return this;
  }

  off = this.removeListener;
  addListener = this.on;
}

export interface ListenerFn<Args extends any[] = any[]> {
  (...args: Args): void;
}

export type ValidEventTypes =
  | string
  | symbol
  | { [K in string | symbol]: any[] | ((...args: any[]) => void) };

export type EventNames<T extends ValidEventTypes> = T extends string | symbol
  ? T
  : keyof T;

export type ArgumentMap<T extends object> = {
  [K in keyof T]: T[K] extends (...args: any[]) => void
    ? Parameters<T[K]>
    : T[K] extends any[]
      ? T[K]
      : any[];
};

export type EventListener<T extends ValidEventTypes,
  K extends EventNames<T>> = T extends string | symbol
  ? (...args: any[]) => void
  : (...args: ArgumentMap<Exclude<T, string | symbol>>[K]) => void;

export type EventArgs<T extends ValidEventTypes,
  K extends EventNames<T>> = Parameters<EventListener<T, K>>;
