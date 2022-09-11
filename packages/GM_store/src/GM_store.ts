import GM_polyfill from '@gm-api/polyfill'

export class GM_store<T> {
  constructor(private readonly key: string, public readonly initialValue: T) {}

  values(): T {
    return GM_polyfill.getValue(
      this.key,
      GM_polyfill.stringify(this.initialValue)
    ) as T
  }

  write(values: T | ((values: T) => T)): T | null {
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
