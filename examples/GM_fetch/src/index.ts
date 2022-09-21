import { GM_fetch, GM_fetchError } from '@gm-api/fetch'

interface Todo {
  userId: number
  id: number
  title: string
  completed: boolean
}

async function boostrap() {
  const url = 'https://jsonplaceholder.typicode.com/todos/1'

  try {
    const response = await GM_fetch(url)
    console.log(await response.json())
  } catch (err) {
    if (err instanceof GM_fetchError) {
      console.log(err.response)
    }
  }

  GM_fetch(url)
    .then<Todo>((response) => response.json())
    .then((todo) => console.log(todo.title))

  GM_fetch(url, { method: 'POST' }).catch((err) =>
    console.log(err instanceof GM_fetchError)
  )
}

boostrap()
