import { ReactElement } from 'react'

import Radio from './Radio'

export type RadioOption = Readonly<{
  id: string
  label: string
}>

type RadioGroupProps = Readonly<{
  nomGroupe: string
  options: Array<RadioOption>
}>

export default function RadioGroup({ nomGroupe, options }: RadioGroupProps): ReactElement {
  return (
    <div>
      {options.map(({ id, label }) => (
        <Radio
          id={id}
          key={id}
          nomGroupe={nomGroupe}
        >
          {label}
        </Radio>
      ))}
    </div>
  )
}
