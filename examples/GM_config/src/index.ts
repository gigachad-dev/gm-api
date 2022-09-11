import { GM_config } from '@gm-api/config'

const config = new GM_config({
  id: 'window-config',
  fields: {
    text: {
      type: 'text',
      default: 'hello'
    },
    number: {
      type: 'number',
      default: 1
    },
    textarea: {
      type: 'textarea',
      default: '123'
    },
    checkbox: {
      label: 'haha:',
      type: 'checkbox',
      checked: false
    },
    select: {
      type: 'select',
      // TODO: FIXME
      selected: 'pizda',
      default: 'pizda',
      options: ['huj', 'pizda']
    }
  }
})

const button = document.createElement('button')
button.textContent = 'Toggle settings'
button.addEventListener('click', () => {
  if (config.isOpen) {
    config.close()
  } else {
    config.open()
  }
})

document.body.appendChild(button)
config.open()
