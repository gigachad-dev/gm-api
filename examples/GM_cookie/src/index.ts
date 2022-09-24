import { GM_cookie } from '@gm-api/cookie'

// 7 days
const expires = new Date()
expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000)

// GM_cookie.set('john', JSON.stringify({ id: 1, name: 'John' }), { expires })

// GM_cookie.set('sam', JSON.stringify({ id: 2, name: 'Sam' }), { expires })

// type Cookies = {
//   john: string
//   sam: string
// }

// const cookies = GM_cookie.list<Cookies>()
// console.log({ cookies, john: JSON.parse(cookies.john) })

// GM_cookie.delete('sam')
// console.log(GM_cookie.list())

const cookie = new GM_cookie({
  serialize(value) {
    return JSON.stringify(value)
  },
  deserialize(value) {
    try {
      return JSON.parse(value)
    } catch (err) {
      return null
    }
  }
})

interface User {
  id: number
  name: string
}

console.log(cookie.get<User>('john'))
cookie.set('le_xot', { id: 3, name: 'Lesha' }, { expires })
console.log(cookie.get<User>('le_xot'))
