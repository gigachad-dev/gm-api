import { GM_emitter } from '@gm-api/emitter'

type Events = {
  'message:lower': (data: string) => void
  'message:upper': (data: string) => void
}

const events = new GM_emitter<Events>()

function toUpper(message: string): void {
  console.log('message:upper', message.toUpperCase())
}

function toUpperAndSplit(message: string): void {
  console.log('message:upper (split)', message.toUpperCase().split(''))
}

function toLower(message: string): void {
  console.log('message:lower', message.toLowerCase())
}

events.on('message:upper', toUpper)
events.on('message:upper', toUpperAndSplit)
events.on('message:lower', toLower)

events.emit('message:upper', 'hello world')
events.emit('message:lower', 'Hello World')

console.log(events.listenerCount('message:upper'))
