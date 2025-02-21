import { ChangeEventHandler, PropsWithChildren, ReactElement } from 'react'

import { noop } from '@/shared/lang'

export default function Select({
  ariaControlsId,
  children,
  id,
  name,
  onChange,
  options,
  required = false,
}: Props): ReactElement {
  return (
    <>
      <label
        className="fr-label"
        htmlFor={id}
      >
        {children}
      </label>
      <select
        className="fr-select fr-mb-2w"
        defaultValue={(options.find((option) => option.isSelected) as { uid: string }).uid}
        id={id}
        name={name}
        onChange={onChange ?? noop}
        required={required}
      >
        {
          options.map((option): ReactElement => (
            <option
              aria-controls={ariaControlsId}
              key={option.uid}
              value={option.uid}
            >
              {option.label}
            </option>
          ))
        }
      </select>
    </>
  )
}

type Props = PropsWithChildren<Readonly<{
  ariaControlsId?: string
  id: string
  name: string
  onChange?: ChangeEventHandler<HTMLSelectElement>
  options: ReadonlyArray<{
    isSelected: boolean
    label: string
    uid: string
  }>
  required?: boolean
}>>
