import {
  addLabel,
  createElement,
  defaultValue,
  isDefined,
  removeElement
} from './helpers.js'
import type { CustomType, Field, FieldValue } from './types.js'

export class GM_configField {
  settings: Field
  id: string
  configId: string
  node: HTMLElement | null
  wrapper: HTMLElement | null
  save: boolean
  value: FieldValue
  default: FieldValue

  constructor(
    settings: Field,
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
    this.save = typeof settings.save === 'undefined' ? true : settings.save

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
        ? customType.default
        : defaultValue(settings.type, settings.options)
      : settings.default

    // Store the field's value
    this.value = typeof stored == 'undefined' ? this['default'] : stored

    // Setup methods for a custom type
    if (customType) {
      this.toNode = customType.toNode
      this.toValue = customType.toValue
      this.reset = customType.reset
    }
  }

  toNode(): HTMLElement {
    var fields = this.settings,
      value = this.value,
      options = fields.options,
      type = fields.type,
      id = this.id,
      configId = this.configId,
      labelPos = fields.labelPos

    var retNode = createElement('div', {
        className: 'config_var',
        id: configId + '_' + id + '_var',
        title: fields.title || ''
      }),
      firstProp

    // Retrieve the first prop
    for (var field in fields) {
      firstProp = field
      break
    }

    const label =
      fields.label && type !== 'button'
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
        retNode.appendChild(
          (this.node = createElement('textarea', {
            innerHTML: value as string,
            id: configId + '_field_' + id,
            className: 'block',
            cols: fields.cols ? fields.cols : 20,
            rows: fields.rows ? fields.rows : 2
          }))
        )
        break
      case 'radio':
        var wrap = createElement('div', {
          id: configId + '_field_' + id
        })
        this.node = wrap

        for (var i = 0, len = options.length; i < len; ++i) {
          var radLabel = createElement(
            'label',
            {
              className: 'radio_label'
            },
            options[i]
          )

          var rad = wrap.appendChild(
            createElement('input', {
              value: options[i],
              type: 'radio',
              name: id,
              checked: options[i] === value
            })
          )

          var radLabelPos =
            labelPos && (labelPos === 'left' || labelPos === 'right')
              ? labelPos
              : firstProp === 'options'
              ? 'left'
              : 'right'

          addLabel(radLabelPos, radLabel, wrap, rad)
        }

        retNode.appendChild(wrap)
        break
      case 'select':
        var wrap = createElement('select', {
          id: configId + '_field_' + id
        })
        this.node = wrap

        for (var i = 0, len = options.length; i < len; ++i) {
          var option = options[i]
          wrap.appendChild(
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

        retNode.appendChild(wrap)
        break
      default:
        // fields using input elements
        var props = {
          id: configId + '_field_' + id,
          type: type,
          value: type === 'button' ? fields.label : value
        }

        switch (type) {
          case 'checkbox':
            props.checked = value
            break
          case 'button':
            props.size = fields.size ? fields.size : 25
            if (fields.script) fields.click = fields.script
            if (fields.click) props.onclick = fields.click
            break
          case 'hidden':
            break
          default:
            // type = text, int, or float
            props.type = 'text'
            props.size = fields.size ? fields.size : 25
        }

        retNode.appendChild((this.node = createElement('input', props)))
    }

    if (label) {
      // If the label is passed first, insert it before the field
      // else insert it after
      if (!labelPos)
        labelPos = firstProp === 'label' || type === 'radio' ? 'left' : 'right'

      addLabel(labelPos, label, retNode)
    }

    return retNode
  }

  toValue(): FieldValue | null {
    var node = this.node,
      field = this.settings,
      type = field.type,
      rval = null

    if (!node) return rval

    switch (type) {
      case 'checkbox':
        rval = node.checked
        break
      case 'select':
        rval = node[node.selectedIndex].value
        break
      case 'radio':
        var radios = node.getElementsByTagName('input')
        for (var i = 0, len = radios.length; i < len; ++i)
          if (radios[i].checked) rval = radios[i].value
        break
      case 'button':
        break
      case 'number':
        var num = Number(node.value)
        var warn = `Field labeled "${field.label}" expects a integer value.`

        if (isNaN(num)) {
          alert(warn)
          return null
        }

        if (!this._checkNumberRange(num, warn)) return null
        rval = num
        break
      default:
        rval = node.value
        break
    }

    return rval // value read successfully
  }

  reset(): void {
    var node = this.node,
      field = this.settings,
      type = field.type

    if (!node) return

    switch (type) {
      case 'checkbox':
        node.checked = this.default
        break
      case 'select':
        for (var i = 0, len = node.options.length; i < len; ++i)
          if (node.options[i].textContent === this.default)
            node.selectedIndex = i
        break
      case 'radio':
        var radios = node.getElementsByTagName('input')
        for (var i = 0, len = radios.length; i < len; ++i)
          if (radios[i].value === this.default) {
            radios[i].checked = true
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

  _checkNumberRange(num: number, warn: string): null | true {
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
