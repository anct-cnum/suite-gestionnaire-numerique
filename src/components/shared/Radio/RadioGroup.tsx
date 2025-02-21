import { ChangeEventHandler, ReactElement } from 'react'

import Radio from './Radio'
import { noop } from '@/shared/lang'

export default function RadioGroup({ nomGroupe, options, onChange }: Props): ReactElement {
  return (
    <div role="radiogroup">
      {options.map(({ isChecked = false, id, label }) => (
        <Radio
          id={id}
          isChecked={isChecked}
          key={id}
          nomGroupe={nomGroupe}
          onChange={onChange ?? noop}
        >
          {label}
        </Radio>
      ))}
    </div>
  )
}

type Props = Readonly<{
  nomGroupe: string
  options: ReadonlyArray<{
    isChecked?: boolean
    id: string
    label: string
  }>
  onChange?: ChangeEventHandler<HTMLInputElement>
}>
