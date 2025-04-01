export type LabelValue<Value extends number | string = string> = Readonly<{
  isSelected?: boolean
  label: string
  value: Value
}>

export type HyperLink = Readonly<{
  label: string
  link: string
}>
