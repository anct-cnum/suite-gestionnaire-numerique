import { ChangeEventHandler, ReactElement } from 'react'

import Radio from './Radio'
import { LabelValue } from '@/presenters/shared/labels'
import { noop } from '@/shared/lang'

export default function RadioGroup({ nomGroupe, onChange, options }: Props): ReactElement {
  return (
    <div role="radiogroup">
      {options.map(({ isSelected = false, label, value }) => (
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
  onChange?: ChangeEventHandler<HTMLInputElement>
  options: ReadonlyArray<LabelValue>
}>
