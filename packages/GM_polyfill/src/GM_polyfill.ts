export class GM_polyfill {
  isGM: boolean
  log: (...data: any[]) => void
  parse: typeof JSON.parse
  stringify: typeof JSON.stringify
  setValue: (key: string, value: string) => void
  getValue: (key: string, defaultValue: string) => string

  constructor() {
    this.isGM =
      typeof GM_getValue !== 'undefined' && typeof GM_setValue !== 'undefined'
    this.log = typeof GM_log !== 'undefined' ? GM_log : console.log
    this.parse = JSON.parse
    this.stringify = JSON.stringify

    if (this.isGM) {
      this.setValue = GM_setValue
      this.getValue = GM_getValue
    } else {
      this.setValue = (name: string, value: string): void => {
        localStorage.setItem(name, value)
      }

      this.getValue = (name: string, defaultValue: string): string => {
        const value = localStorage.getItem(name)
        return value === null ? defaultValue : value
      }
    }
  }
}
