import { ChangeEventHandler, ReactElement } from 'react'

import Radio from './Radio'

export default function RadioGroup({ nomGroupe, options, onChange }: RadioGroupProps): ReactElement {
  return (
    <div role="radiogroup">
      {options.map(({ id, label }) => (
        <Radio
          id={id}
          key={id}
          nomGroupe={nomGroupe}
          onChange={onChange}
        >
          {label}
        </Radio>
      ))}
    </div>
  )
}

type RadioOption = Readonly<{
  id: string
  label: string
}>

type RadioGroupProps = Readonly<{
  nomGroupe: string
  options: ReadonlyArray<RadioOption>
  onChange: ChangeEventHandler<HTMLInputElement>
}>
