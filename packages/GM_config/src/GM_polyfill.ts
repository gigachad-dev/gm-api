import { isDefined } from './helpers'

declare function GM_getValue(key: string, defaultValue: string): string
declare function GM_setValue(key: string, value: string): void
declare function GM_log(...values: string[]): void

export class GM_polyfill {
  isGM: boolean
  setValue: (key: string, value: string) => void
  getValue: (key: string, defaultValue: string) => string
  stringify: typeof JSON.stringify
  parse: typeof JSON.parse
  log: (...data: any[]) => void

  constructor() {
    this.isGM = isDefined(GM_getValue) && isDefined(GM_setValue)
    this.stringify = JSON.stringify
    this.parse = JSON.parse
    this.log = isDefined(GM_log) ? GM_log : console.log

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
