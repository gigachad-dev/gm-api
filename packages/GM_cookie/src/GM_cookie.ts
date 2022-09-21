import type { CookieOptions } from './types.js'

export class GM_cookie {
  static delete(name: string) { }

  static list() { }

  static set(name: string, value: string, options: CookieOptions): void { }

  static get(name: string): string | null {
    const matches = document.cookie.match(
      new RegExp(
        `(?:^|; )${name.replace(
          /([\.$?*|{}\(\)\[\]\\\/\+^])/g,
          '\\$1'
        )}=([^;]*)`
      )
    )

    return matches ? decodeURIComponent(matches[1]!) : null
  }
}
