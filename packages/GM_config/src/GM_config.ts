import { GM_configField } from './GM_configField.js'
import { GM_configInit } from './GM_configInit.js'
import { GM_polyfill } from './GM_polyfill.js'
import { createElement, isDefined, removeElement } from './helpers.js'
import type {
  BaseEvent,
  EventClose,
  EventOpen,
  EventReset,
  EventSave,
  FieldValue,
  InitOptions
} from './types.js'

export class GM_config extends GM_polyfill {
  id: string
  title: string
  css: {
    basic: string[]
    basicPrefix: string
    stylish: string
  }
  fields: Record<string, GM_configField>
  isOpen: boolean
  frame: HTMLIFrameElement | null

  onInit: BaseEvent
  onOpen: EventOpen
  onSave: EventSave
  onClose: EventClose
  onReset: EventReset

  constructor(config: InitOptions) {
    super()

    if (config) {
      this.init(config)
    }
  }

  init(args: InitOptions) {
    GM_configInit(this, arguments)
    this.onInit()
  }

  // call GM_config.open() from your script to open the menu
  open(): void {
    // Die if the menu is already open on this page
    // You can have multiple instances but you can't open the same instance twice
    const match = document.getElementById(this.id)
    if (match && (match.tagName === 'IFRAME' || match.childNodes.length > 0))
      return

    // Function to build the mighty config window :)
    const buildConfigWindow = (body: HTMLElement, head: HTMLElement): void => {
      const fields = this.fields
      const configId = this.id
      const bodyWrapper = createElement('div', {
        id: configId + '_wrapper'
      })

      // Append the style which is our default style plus the user style
      head.appendChild(
        createElement('style', {
          type: 'text/css',
          textContent: this.css.basic + this.css.stylish
        })
      )

      // Add header and title
      bodyWrapper.appendChild(
        createElement(
          'div',
          {
            id: configId + '_header',
            className: 'config_header block center'
          },
          this.title
        )
      )

      // Append elements
      let section = bodyWrapper
      let secNum = 0 // Section count

      // loop through fields
      for (const field of Object.values(fields)) {
        const settings = field.settings
        const settingsSection = settings.section

        if (settingsSection) {
          // the start of a new section
          section = bodyWrapper.appendChild(
            createElement('div', {
              className: 'section_header_holder',
              id: configId + '_section_' + secNum
            })
          )

          if (Array.isArray(settingsSection)) {
            settings.section = [settingsSection]
          }

          if (settingsSection[0])
            section.appendChild(
              createElement(
                'div',
                {
                  className: 'section_header center',
                  id: configId + '_section_header_' + secNum
                },
                settingsSection[0]
              )
            )

          if (settingsSection[1])
            section.appendChild(
              createElement(
                'p',
                {
                  className: 'section_desc center',
                  id: configId + '_section_desc_' + secNum
                },
                settingsSection[1]
              )
            )
          ++secNum
        }

        // Create field elements and append to current section
        section.appendChild((field.wrapper = field.toNode()))
      }

      // Add save and close buttons
      bodyWrapper.appendChild(
        createElement('div', { id: configId + '_buttons_holder' }, [
          createElement('button', {
            id: configId + '_saveBtn',
            textContent: 'Save',
            title: 'Save settings',
            className: 'button',
            onclick: () => {
              this.save()
            }
          }),
          createElement('button', {
            id: configId + '_closeBtn',
            textContent: 'Close',
            title: 'Close window',
            className: 'button',
            onclick: () => {
              this.close()
            }
          }),
          createElement('div', { className: 'reset_holder block' }, [
            createElement('a', {
              id: configId + '_exportLink',
              textContent: 'Export',
              href: '#',
              title: 'Export config',
              className: 'reset',
              onclick: (event) => {
                event.preventDefault()
                this.export()
              }
            }),

            createElement('a', {
              id: configId + '_importLink',
              textContent: 'Import',
              href: '#',
              title: 'Import config',
              className: 'reset',
              onclick: (event) => {
                event.preventDefault()
                this.import()
              }
            }),

            createElement('a', {
              id: configId + '_resetLink',
              textContent: 'Reset to defaults',
              href: '#',
              title: 'Reset fields to default values',
              className: 'reset',
              onclick: (event) => {
                event.preventDefault()
                this.reset()
              }
            })

          ])

        ])
      )

      body.appendChild(bodyWrapper) // Paint everything to window at once
      this.center() // Show and center iframe
      window.addEventListener('resize', this.center, false) // Center frame on resize

      // Call the open() callback function
      this.onOpen(
        this.frame!.contentDocument || this.frame!.ownerDocument,
        this.frame!.contentWindow || window,
        this.frame!
      )

      // Close frame on window close
      window.addEventListener(
        'beforeunload',
        () => {
          this.close()
        },
        false
      )

      // Now that everything is loaded, make it visible
      this.frame!.style.display = 'block'
      this.isOpen = true
    }

    const defaultStyle =
      'bottom: auto; border: 1px solid #000; display: none; height: 75%;' +
      'left: 0; margin: 0; max-height: 95%; max-width: 95%; opacity: 0;' +
      'overflow: auto; padding: 0; position: fixed; right: auto; top: 0;' +
      'width: 75%; z-index: 9999;'

    // Either use the element passed to init() or create an iframe
    if (this.frame) {
      this.frame.id = this.id // Allows for prefixing styles with the config id
      this.frame.setAttribute('style', defaultStyle)
      buildConfigWindow(
        this.frame,
        this.frame.ownerDocument.getElementsByTagName('head')[0]!
      )
    } else {
      // Create frame
      document.body.appendChild(
        (this.frame = createElement('iframe', {
          id: this.id,
          style: defaultStyle
        }))
      )

      // In WebKit src can't be set until it is added to the page
      this.frame.src = 'about:blank'
      this.frame.addEventListener(
        'load',
        (event) => {
          const frame = this.frame
          if (!frame) return

          if (frame.src && !frame.contentDocument) {
            // Some agents need this as an empty string for newer context implementations
            frame.src = ''
          } else if (!frame.contentDocument) {
            this.log(
              'GM_config failed to initialize default settings dialog node!'
            )
          }

          const body = frame.contentDocument!.getElementsByTagName('body')[0]!
          body.id = this.id // Allows for prefixing styles with the config id
          buildConfigWindow(
            body,
            frame.contentDocument!.getElementsByTagName('head')[0]!
          )
        },
        false
      )
    }
  }

  import(): void {
    const input = createElement('input', {
      type: 'file',
      accept: 'application/json',
      multiple: false
    })

    input.addEventListener('change', () => {
      const file = input.files![0]
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        try {
          const config = this.parse(reader.result as string)
          this.writeStore(this.id, config)
          Object.entries(config).forEach((values) => this.set(...values))
        } catch (err) {
          console.log(err)
          this.log('GM_config failed to parse JSON file!')
        }
      })

      reader.readAsText(file!)
    })

    input.click()
  }

  export(): void {
    const config = this.read()
    if (!Object.keys(config).length) return

    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'text/json'
    })

    const link = createElement('a', {
      href: URL.createObjectURL(blob),
      download: `${this.id}-${Date.now()}.json`
    })

    link.click()
    link.remove()
  }

  save(): void {
    const forgotten = this.write()
    this.onSave(forgotten)
  }

  close(): void {
    if (!this.frame) return
    if (this.frame.contentDocument) {
      removeElement(this.frame)
      this.frame = null
    } else {
      this.frame.innerHTML = ''
      this.frame.style.display = 'none'
    }

    for (const field of Object.values(this.fields)) {
      field.wrapper = null
      field.node = null
    }

    this.onClose()
    this.isOpen = false
  }

  set(name: string, val: any): void {
    const field = this.fields[name]
    if (!field) return

    field.value = val
    if (field.node) {
      field.reload()
    }
  }

  get(name: string, getLive: boolean): FieldValue | undefined {
    const field = this.fields[name]
    if (!field) return

    let fieldValue: FieldValue | null = null
    if (getLive && field.node) {
      fieldValue = field.toValue()
    }

    return isDefined(fieldValue) ? fieldValue : field.value
  }

  write(store?: string, obj?: any): Record<string, any> {
    const values: Record<string, any> = {}
    const forgotten: Record<string, any> = {}
    const fields = this.fields

    if (!obj) {
      for (const [id, field] of Object.entries(fields)) {
        const value = field!.toValue()

        if (field.save) {
          if (value != null) {
            values[id] = value
            field.value = value
          } else {
            values[id] = field.value
          }
        } else {
          forgotten[id] = value
        }
      }
    }

    this.writeStore(store || this.id, obj || values)

    return forgotten
  }

  read(store?: string): any {
    try {
      return this.parse(this.getValue(store || this.id, '{}'))
    } catch (e) {
      this.log('GM_config failed to read saved settings!')
      return {}
    }
  }

  reset(): void {
    for (const field of Object.values(this.fields)) {
      field.reset()
    }

    this.onReset()
  }

  center(): void {
    const node = this.frame
    if (!node) return

    const style = node.style
    if (style.display === 'none') {
      style.opacity = '0'
    }

    style.display = ''
    style.top =
      Math.floor(window.innerHeight / 2 - node.offsetHeight / 2) + 'px'
    style.left = Math.floor(window.innerWidth / 2 - node.offsetWidth / 2) + 'px'
    style.opacity = '1'
  }
}
