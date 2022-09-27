import { EventMap, TypedEventEmitter } from './types.js'

export class GM_emitter<T extends EventMap> implements TypedEventEmitter<T> {
  #events: Record<string | number | symbol, Function[]> = {}

  on<E extends keyof T>(event: E, listener: T[E]): this {
    const events = this.#events[event]
    if (events) {
      events.push(listener)
    } else {
      this.#events[event] = [listener]
    }

    return this
  }

  off<E extends keyof T>(event: E, listener: T[E]): this {
    if (this.#events[event]) {
      this.#events[event] = this.#events[event].filter(
        (event) => event !== listener
      )
    }

    return this
  }

  emit<E extends keyof T>(event: E, ...args: Parameters<T[E]>): this {
    const events = this.#events[event] || []
    for (let i = 0; i < events.length; i++) {
      events[i]!(...args)
    }
    return this
  }

  removeAllListeners<E extends keyof T>(event?: E | undefined): this {
    if (event) {
      delete this.#events[event]
    } else {
      this.#events = {}
    }

    return this
  }

  eventNames(): (string | symbol | keyof T)[] {
    return Object.keys(this.#events)
  }

  listeners<E extends keyof T>(event: E): T[E][] {
    return this.#events[event] as T[E][]
  }

  listenerCount<E extends keyof T>(event: E): number {
    return this.#events[event]?.length ?? 0
  }
}
