import type { CookieOptions } from './types.js'

export class GM_cookie {
  static get(name: string): string | null {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)

    if (parts.length === 2) {
      const value = parts.pop()?.split(';').shift()
      return value ? decodeURIComponent(value) : null
    }

    return null
  }

  static set(name: string, value: string, options: CookieOptions = {}): void {
    options = {
      path: '/',
      ...options
    }

    if (options.expires instanceof Date) {
      options.expires = options.expires.toUTCString()
    }

    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

    for (const [key, value] of Object.entries(options)) {
      cookie += `; ${key}`
      if (value !== true) {
        cookie += `=${value}`
      }
    }

    document.cookie = cookie
  }

  static list<T extends Record<string, string>>(): T | Record<string, string> {
    return document.cookie.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.split('=').map((v) => v.trim())
      if (!name || !value) return acc
      return { ...acc, [name]: decodeURIComponent(value) }
    }, {})
  }

  static delete(name: string) {
    this.set(name, '', { expires: -1 })
  }
}
