import { GM_cookie } from '@gm-api/cookie'

const expires = new Date()
// 7 days
expires.setDate(expires.getTime() + 7 * 24 * 60 * 60 * 1000)

GM_cookie.set('john', JSON.stringify({ id: 1, name: 'John' }), { expires })

GM_cookie.set('sam', JSON.stringify({ id: 2, name: 'Sam' }), { expires })

type Cookies = {
  john: string
  sam: string
}

const cookies = GM_cookie.list<Cookies>()
console.log({ cookies, john: JSON.parse(cookies.john) })

GM_cookie.delete('sam')
console.log(GM_cookie.list())
