export class GM_polyfill {
  isGM: boolean

  constructor() {
    this.isGM = typeof GM_info !== 'undefined'

    if (this.isGM) {
      this.log = GM_log
      this.setValue = GM_setValue
      this.getValue = GM_getValue
    }
  }

  log(...data: any[]): void {
    console.log(data)
  }

  getValue(name: string, defaultValue?: string): string | null {
    const value = localStorage.getItem(name)
    return value ?? defaultValue ?? null
  }

  setValue(name: string, value: string): void {
    localStorage.setItem(name, value)
  }
}
