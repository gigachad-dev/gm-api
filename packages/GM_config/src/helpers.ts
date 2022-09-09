import type { ElementAttributes, FieldTypes } from './types.js'

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null
}

export function defaultValue<T extends FieldTypes>(
  type: T,
  options: any
): string | boolean | number {
  switch (type) {
    case 'radio':
    case 'select':
      return options[0]
    case 'checkbox':
      return false
    case 'number':
      return 0
    default:
      return ''
  }
}

export function addLabel(
  pos: string,
  labelEl: HTMLElement | ChildNode,
  parentNode: HTMLElement | ChildNode,
  beforeEl?: HTMLElement | ChildNode | null
): void {
  if (!beforeEl) {
    beforeEl = parentNode.firstChild
  }

  switch (pos) {
    case 'right':
    case 'below':
      if (pos === 'below') {
        parentNode.appendChild(createElement('br'))
      }
      parentNode.appendChild(labelEl)
      break
    default:
      if (pos === 'above') {
        parentNode.insertBefore(createElement('br'), beforeEl)
      }
      parentNode.insertBefore(labelEl, beforeEl)
  }
}

export function createElement<T extends keyof HTMLElementTagNameMap>(
  tag: T,
  attributes?: ElementAttributes<T>,
  children?: string | any[]
): HTMLElementTagNameMap[T] {
  const element = document.createElement(tag)

  if (attributes) {
    Object.assign(element, attributes)
  }

  if (children) {
    if (Array.isArray(children)) {
      element.append(...children)
    } else {
      element.innerHTML = children
    }
  }

  return element
}

export function removeElement(el?: HTMLElement): void {
  if (el && el.parentNode) {
    el.parentNode.removeChild(el)
  }
}
