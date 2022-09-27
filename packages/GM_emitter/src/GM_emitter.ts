import { EventMap, TypedEventEmitter } from './types.js'

export class GM_emitter<T extends EventMap> implements TypedEventEmitter<T> {
  private readonly events = new Map<string | number | symbol, Function[]>()

  addListener<E extends keyof T>(event: E, listener: T[E]): this {
    const events = this.events.get(event)
    events?.push(listener) || this.events.set(event, [listener])
    return this
  }

  on<E extends keyof T>(event: E, listener: T[E]): this {
    throw new Error('Method not implemented.')
  }

  once<E extends keyof T>(event: E, listener: T[E]): this {
    throw new Error('Method not implemented.')
  }

  off<E extends keyof T>(event: E, listener: T[E]): this {
    throw new Error('Method not implemented.')
  }

  removeAllListeners<E extends keyof T>(event?: E | undefined): this {
    throw new Error('Method not implemented.')
  }

  removeListener<E extends keyof T>(event: E, listener: T[E]): this {
    throw new Error('Method not implemented.')
  }

  emit<E extends keyof T>(event: E, ...args: Parameters<T[E]>): boolean {
    throw new Error('Method not implemented.')
  }

  eventNames(): (string | symbol | keyof T)[] {
    throw new Error('Method not implemented.')
  }

  rawListeners<E extends keyof T>(event: E): T[E][] {
    throw new Error('Method not implemented.')
  }

  listeners<E extends keyof T>(event: E): T[E][] {
    throw new Error('Method not implemented.')
  }

  listenerCount<E extends keyof T>(event: E): number {
    throw new Error('Method not implemented.')
  }
}
