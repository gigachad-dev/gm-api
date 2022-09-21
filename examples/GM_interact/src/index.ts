import { GM_interact } from '@gm-api/interact'
import './style.css'

const overlay = document.createElement('section')
overlay.classList.add('overlay')

const card = document.createElement('div')
card.textContent = 'Lorem ipsum dolor sit amet consectetur adipisicing elit.'
card.classList.add('card')
overlay.appendChild(card)
document.body.appendChild(overlay)

const interact = new GM_interact(card, {
  constrain: true,
  relativeTo: overlay
})
