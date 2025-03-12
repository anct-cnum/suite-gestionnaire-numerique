export type LabelValue<Value extends string | number = string> = Readonly<{
  label: string
  value: Value
  isSelected?: boolean
}>
