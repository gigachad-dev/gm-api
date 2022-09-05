import { GM_config } from './GM_config.js'
import { createElement } from './helpers.js'

const config = new GM_config({
  events: {
    init: () => console.log('init'),
    open: () => console.log('open'),
    close: () => console.log('close'),
    save: () => console.log('save'),
    reset: () => console.log('reset')
  },
  id: 'MyConfig',
  title: 'TEST 123',
  fields: {
    field1: {
      type: 'number',
      default: 123,
      label: 'Number:'
    },
    field2: {
      type: 'button',
      label: 'Button:',
      default: 'huj',
      click: (event: MouseEvent) => {
        console.log(event)
      }
    },
    field3: {
      type: 'radio',
      label: 'Radio:',
      options: ['1', '2']
    },
    field4: {
      type: 'textarea',
      label: 'Textarea:',
      default: 'huj',
      cols: 50,
      rows: 1
    },
    field5: {
      type: 'select',
      options: [
        'ru',
        'en',
        'uk',
        'cz'
      ],
      default: 'ru',
      label: 'Select:'
    },
    field6: {
      type: 'checkbox',
      default: true,
      label: 'Checkbox:'
    }
  }
})

const button = createElement('button', {
  textContent: 'Open',
  onclick: () => config.open()
})

document.body.appendChild(button)

config.open()
