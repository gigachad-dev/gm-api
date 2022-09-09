import {
  addLabel,
  createElement,
  defaultValue,
  isDefined,
  removeElement
} from './helpers.js'
import type { CustomType, FieldValue, Fields } from './types.js'

export class GM_configField {
  settings: Fields
  id: string
  configId: string
  node: HTMLElement | null
  wrapper: HTMLElement | null
  save: boolean
  value: FieldValue
  default: FieldValue

  constructor(
    settings: Fields,
    stored: FieldValue | undefined,
    id: string,
    customType: CustomType | undefined,
    configId: string
  ) {
    // Store the field's settings
    this.settings = settings
    this.id = id
    this.configId = configId
    this.node = null
    this.wrapper = null
    this.save = !isDefined(settings.save) ?? settings.save

    // Buttons are static and don't have a stored value
    if (settings.type === 'button') {
      this.save = false
    }

    // if a default value wasn't passed through init() then
    //   if the type is custom use its default value
    //   else use default value for type
    // else use the default value passed through init()
    this.default = !isDefined(settings.default)
      ? customType
        ? customType.default!
        : defaultValue(settings.type, settings.options)
      : settings.default

    // Store the field's value
    this.value = isDefined(stored) ? stored : this.default

    // Setup methods for a custom type
    if (customType) {
      this.toNode = customType.toNode!
      this.toValue = customType.toValue!
      this.reset = customType.reset!
    }
  }

  toNode(): HTMLElement {
    const fields = this.settings
    const value = this.value
    const options = fields.options
    const type = fields.type
    const id = this.id
    const configId = this.configId

    const fieldNode = createElement('div', {
      className: 'config_var',
      id: configId + '_' + id + '_var',
      title: fields.title || ''
    })

    // Retrieve the first prop
    let firstProp = fields[0]
    let labelPosition = fields.position

    const label = fields.label
      ? createElement(
          'label',
          {
            id: configId + '_' + id + '_field_label',
            htmlFor: configId + '_field_' + id,
            className: 'field_label'
          },
          [fields.label]
        )
      : null

    switch (type) {
      case 'textarea':
        fieldNode.appendChild(
          (this.node = createElement('textarea', {
            innerHTML: value as string,
            id: configId + '_field_' + id,
            className: 'block',
            cols: fields.cols ?? 20,
            rows: fields.rows ?? 2
          }))
        )
        break
      case 'radio':
        this.node = createElement('div', {
          id: configId + '_field_' + id
        })

        for (const option of options) {
          const radioLabel = createElement(
            'label',
            { className: 'radio_label' },
            option
          )

          const radioButton = this.node.appendChild(
            createElement('input', {
              value: option,
              type: 'radio',
              name: id,
              checked: option === value
            })
          )

          const radioLabelPosition =
            labelPosition &&
            (labelPosition === 'left' || labelPosition === 'right')
              ? labelPosition
              : firstProp === 'options'
              ? 'right'
              : 'left'

          addLabel(radioLabelPosition, radioLabel, this.node, radioButton)
        }

        fieldNode.appendChild(this.node)
        break
      case 'select':
        this.node = createElement('select', {
          id: configId + '_field_' + id
        })

        for (const option of options) {
          this.node.appendChild(
            createElement(
              'option',
              {
                value: option,
                selected: option === value
              },
              option
            )
          )
        }

        fieldNode.appendChild(this.node)
        break
      default:
        // fields using input elements
        const props: any = {
          id: configId + '_field_' + id,
          type,
          value
        }

        switch (type) {
          case 'checkbox':
            props.checked = value
            break
          case 'button':
            if (fields.script) {
              fields.click = fields.script
            }

            if (fields.click) {
              props.onclick = fields.click
            }
            break
          case 'hidden':
            break
          case 'number':
            props.type = 'number'
            break
          default:
            props.type = 'text'
        }

        props.size = fields.size ?? 25
        fieldNode.appendChild((this.node = createElement('input', props)))
    }

    if (label) {
      // If the label is passed first, insert it before the field
      // else insert it after
      if (!labelPosition) {
        labelPosition = firstProp === 'label' ? 'right' : 'left'
      }

      addLabel(labelPosition, label, fieldNode)
    }

    return fieldNode
  }

  toValue(): FieldValue | null {
    const node = this.node as any
    const field = this.settings
    const type = field.type
    let fieldValue = null

    if (!node) return fieldValue

    switch (type) {
      case 'checkbox':
        fieldValue = node.checked
        break
      case 'select':
        fieldValue = node[node.selectedIndex].value
        break
      case 'radio':
        const radios = (node as HTMLElement).getElementsByTagName('input')
        for (const radio of Object.values(radios)) {
          if (radio.checked) {
            fieldValue = radio.value
          }
        }
        break
      case 'button':
        break
      case 'number':
        const num = Number(node.value)
        const warn = `Field labeled \`${field.label}\` expects a integer value.`

        if (isNaN(num)) {
          alert(warn)
          return null
        }

        if (!this.checkNumberRange(num, warn)) return null
        fieldValue = num
        break
      default:
        fieldValue = node.value
        break
    }

    return fieldValue
  }

  reset(): void {
    const node = this.node as any
    const field = this.settings
    const type = field.type

    if (!node) return

    switch (type) {
      case 'checkbox':
        node.checked = this.default
        break
      case 'select':
        for (let i = 0, len = node.options.length; i < len; ++i) {
          if (node.options[i].textContent === this.default) {
            node.selectedIndex = i
          }
        }
        break
      case 'radio':
        const radios = node.getElementsByTagName('input')
        for (const radio of radios) {
          if (radio.value === this.default) {
            radio.checked = true
          }
        }
        break
      case 'button':
        break
      default:
        node.value = this.default
        break
    }
  }

  remove(el?: HTMLElement): void {
    removeElement(el || this.wrapper!)
    this.wrapper = null
    this.node = null
  }

  reload(): void {
    const wrapper = this.wrapper
    if (wrapper) {
      const fieldParent = wrapper.parentNode
      fieldParent!.insertBefore((this.wrapper = this.toNode()), wrapper)
      this.remove(wrapper)
    }
  }

  checkNumberRange(num: number, warn: string): null | true {
    const field = this.settings
    if (typeof field.min === 'number' && num < field.min) {
      alert(warn + ' greater than or equal to ' + field.min + '.')
      return null
    }

    if (typeof field.max === 'number' && num > field.max) {
      alert(warn + ' less than or equal to ' + field.max + '.')
      return null
    }

    return true
  }
}
