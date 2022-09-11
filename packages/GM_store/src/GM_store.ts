import GM_polyfill from '@gm-api/polyfill'

type ExcludeFunction<T> = T extends Function ? never : T

export class GM_store<T> {
  constructor(private readonly key: string, public readonly initialValue: T) {}

  static create<T>(key: string, value: ExcludeFunction<T>): GM_store<T> {
    return new GM_store<T>(key, value)
  }

  values(): T {
    return GM_polyfill.getValue(
      this.key,
      GM_polyfill.stringify(this.initialValue)
    ) as T
  }

  write(value: T): T
  write(value: (prevValue: T) => T): T
  write(values: T | ((prevValue: T) => T)): T | null {
    if (values instanceof Function) {
      values = values(this.values())
    }

    try {
      GM_polyfill.setValue(this.key, GM_polyfill.stringify(values))
    } catch {
      GM_polyfill.log('GM_store failed to save')
    } finally {
      return values
    }
  }

  reset(): void {
    this.write(this.initialValue)
  }
}
