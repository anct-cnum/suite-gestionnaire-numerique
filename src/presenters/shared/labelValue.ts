export type LabelValue<Value extends number | string = string> = Readonly<{
  isSelected?: boolean
  label: string
  value: Value
}>
