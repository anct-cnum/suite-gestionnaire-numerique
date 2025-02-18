import { ChangeEventHandler, ReactElement } from 'react'

import Radio from './Radio'

export default function RadioGroup({ nomGroupe, options, onChange }: Props): ReactElement {
  return (
    <div role="radiogroup">
      {options.map(({ id, label }) => (
        <Radio
          id={id}
          key={id}
          nomGroupe={nomGroupe}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...onChange ? { onChange } : {}}
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
    id: string
    label: string
  }>
  onChange?: ChangeEventHandler<HTMLInputElement>
}>
