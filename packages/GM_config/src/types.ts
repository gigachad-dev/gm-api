export type ElementAttributes<T extends keyof HTMLElementTagNameMap> = Partial<
  {
    style: Partial<CSSStyleDeclaration>
  } & Omit<HTMLElementTagNameMap[T], 'style'>
>

export type FieldValue = string | number | boolean

export enum EnumFieldTypes {
  text = 'text',
  textarea = 'textarea',
  button = 'button',
  radio = 'radio',
  select = 'select',
  checkbox = 'checkbox',
  number = 'number',
  hidden = 'hidden'
}

/** Valid types for Field `type` property */
export type FieldTypes = keyof typeof EnumFieldTypes
export type Fields =
  | FieldText
  | FieldTextarea
  | FieldButton
  | FieldRadio
  | FieldSelect
  | FieldCheckbox
  | FieldNumber
  | FieldHidden

export interface FieldText extends Field {
  type: EnumFieldTypes.text
}

export interface FieldTextarea extends Field {
  type: EnumFieldTypes.textarea
  cols?: number
  rows?: number
}

export interface FieldButton extends Field {
  type: EnumFieldTypes.button
  size?: number
  onclick?: (event: MouseEvent) => void
}

export interface FieldRadio extends Field {
  type: EnumFieldTypes.radio
}

export interface FieldSelect extends Field {
  type: EnumFieldTypes.select
  options: string[]
  selected: string
}

export interface FieldCheckbox extends Field {
  type: EnumFieldTypes.checkbox
  checked: boolean
}

export interface FieldNumber extends Field {
  type: EnumFieldTypes.number
}

export interface FieldHidden extends Field {
  type: EnumFieldTypes.hidden
  visible: boolean
}

export type BaseEvent = () => void
export type EventInit = BaseEvent
export type EventClose = BaseEvent
export type EventReset = BaseEvent
export type EventOpen = (
  document: Document,
  window: Window,
  frame: HTMLElement
) => void
export type EventSave = (values: any) => void

/** Init options where no custom types are defined */
export interface InitOptionsNoCustom {
  /** Used for this instance of GM_config */
  id: string
  /** Label the opened config window */
  title?: string | HTMLElement
  fields: Record<string, Field>
  /** Optional styling to apply to the menu */
  css?: string
  /** Element to use for the config panel */
  frame?: HTMLElement

  /** Handlers for different events */
  events?: {
    init?: EventInit
    open?: EventOpen
    save?: EventSave
    close?: EventClose
    reset?: EventReset
  }
}

/** Init options where custom types are defined */
export interface InitOptionsCustom<CustomTypes extends string = never>
  extends Omit<InitOptionsNoCustom, 'fields'> {
  fields: Record<string, Field<CustomTypes>>
  /** Custom fields */
  types: Record<CustomTypes, CustomType>
}

/** Init options where the types key is only required if custom types are used */
export type InitOptions<CustomTypes extends string = never> =
  | InitOptionsNoCustom
  | InitOptionsCustom<CustomTypes>

export interface Field<CustomTypes extends string = never> {
  [key: string]: any
  /** Display label for the field */
  label?: string | HTMLElement
  /** Type of input */
  type: FieldTypes | CustomTypes
  /** Text to show on hover */
  title?: string
  /** Default value for field */
  default?: FieldValue
  save?: boolean
}

export type ToNode = (configId?: string) => HTMLElement
export type ToValue = () => FieldValue | null

export interface CustomType {
  default?: FieldValue | null
  toNode?: ToNode
  toValue?: ToValue
  reset?: BaseEvent
}
