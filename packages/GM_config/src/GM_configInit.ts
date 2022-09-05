import { GM_configField } from './GM_configField.js'

export function GM_configInit(config, args) {
  if (typeof config.fields == 'undefined') {
    config.fields = {}
    config.onInit = config.onInit || function () {}
    config.onOpen = config.onOpen || function () {}
    config.onSave = config.onSave || function () {}
    config.onClose = config.onClose || function () {}
    config.onReset = config.onReset || function () {}
    config.isOpen = false
    config.title = 'User Script Settings'
    config.css = {
      basic: [
          '#GM_config * { font-family: arial,tahoma,myriad pro,sans-serif; }',
          '#GM_config { background: #FFF; }',
          "#GM_config input[type='radio'] { margin-right: 8px; }",
          '#GM_config .indent40 { margin-left: 40%; }',
          '#GM_config .field_label { font-size: 12px; font-weight: bold; margin-right: 6px; }',
          '#GM_config .radio_label { font-size: 12px; }',
          '#GM_config .block { display: block; }',
          '#GM_config .saveclose_buttons { margin: 16px 10px 10px; padding: 2px 12px; }',
          '#GM_config .reset, #GM_config .reset a,' +
            ' #GM_config_buttons_holder { color: #000; text-align: right; }',
          '#GM_config .config_header { font-size: 20pt; margin: 0; }',
          '#GM_config .config_desc, #GM_config .section_desc, #GM_config .reset { font-size: 9pt; }',
          '#GM_config .center { text-align: center; }',
          '#GM_config .section_header_holder { margin-top: 8px; }',
          '#GM_config .config_var { margin: 0 0 4px; }',
          '#GM_config .section_header { background: #414141; border: 1px solid #000; color: #FFF;',
          ' font-size: 13pt; margin: 0; }',
          '#GM_config .section_desc { background: #EFEFEF; border: 1px solid #CCC; color: #575757;' +
            ' font-size: 9pt; margin: 0 0 6px; }'
        ].join('\n') + '\n',
      basicPrefix: 'GM_config',
      stylish: ''
    }
  }

  if (
    args.length == 1 &&
    typeof args[0].id == 'string' &&
    typeof args[0].appendChild != 'function'
  )
    var settings = args[0]
  else {
    // Provide backwards-compatibility with argument style intialization
    var settings = {}

    // loop through GM_config.init() arguments
    for (var i = 0, l = args.length, arg; i < l; ++i) {
      arg = args[i]

      // An element to use as the config window
      if (typeof arg.appendChild == 'function') {
        settings.frame = arg
        continue
      }

      switch (typeof arg) {
        case 'object':
          for (var j in arg) {
            // could be a callback functions or settings object
            if (typeof arg[j] != 'function') {
              // we are in the settings object
              settings.fields = arg // store settings object
              break // leave the loop
            } // otherwise it must be a callback function
            if (!settings.events) settings.events = {}
            settings.events[j] = arg[j]
          }
          break
        case 'function': // passing a bare function is set to open callback
          settings.events = { onOpen: arg }
          break
        case 'string': // could be custom CSS or the title string
          if (/\w+\s*\{\s*\w+\s*:\s*\w+[\s|\S]*\}/.test(arg)) settings.css = arg
          else settings.title = arg
          break
        default:
      }
    }
  }

  /* Initialize everything using the new settings object */
  // Set the id
  if (settings.id) config.id = settings.id
  else if (typeof config.id == 'undefined') config.id = 'GM_config'

  // Set the title
  if (settings.title) config.title = settings.title

  // Set the custom css
  if (settings.css) config.css.stylish = settings.css

  // Set the frame
  if (settings.frame) config.frame = settings.frame

  // Set the event callbacks
  if (settings.events) {
    var events = settings.events
    for (var e in events)
      config['on' + e.charAt(0).toUpperCase() + e.slice(1)] = events[e]
  }

  // Create the fields
  if (settings.fields) {
    var stored = config.read(), // read the stored settings
      fields = settings.fields,
      customTypes = settings.types || {},
      configId = config.id

    for (var id in fields) {
      var field = fields[id]

      // for each field definition create a field object
      if (field)
        config.fields[id] = new GM_configField(
          field,
          stored[id],
          id,
          customTypes[field.type],
          configId
        )
      else if (config.fields[id]) delete config.fields[id]
    }
  }

  // If the id has changed we must modify the default style
  if (config.id != config.css.basicPrefix) {
    config.css.basic = config.css.basic.replace(
      new RegExp('#' + config.css.basicPrefix, 'gm'),
      '#' + config.id
    )
    config.css.basicPrefix = config.id
  }
}
