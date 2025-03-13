import { ChangeEventHandler, ReactElement } from 'react'

import Radio from './Radio'
import { LabelValue } from '@/presenters/shared/labelValue'
import { noop } from '@/shared/lang'

export default function RadioGroup({ nomGroupe, options, onChange }: Props): ReactElement {
  return (
    <div role="radiogroup">
      {options.map(({ isSelected = false, value, label }) => (
        <Radio
          id={value}
          isChecked={isSelected}
          key={value}
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
  options: ReadonlyArray<LabelValue>
  onChange?: ChangeEventHandler<HTMLInputElement>
}>
