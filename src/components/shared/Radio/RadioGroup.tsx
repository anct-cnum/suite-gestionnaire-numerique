import { ReactElement } from 'react'

import Radio from './Radio'

export default function RadioGroup({ nomGroupe, options }: RadioGroupProps): ReactElement {
  return (
    <div role="radiogroup">
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

export type RadioOption = Readonly<{
  id: string
  label: string
}>

type RadioGroupProps = Readonly<{
  nomGroupe: string
  options: ReadonlyArray<RadioOption>
}>
