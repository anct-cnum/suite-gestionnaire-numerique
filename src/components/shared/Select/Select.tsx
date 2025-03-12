import { ChangeEventHandler, PropsWithChildren, ReactElement } from 'react'

import { LabelValue } from '@/presenters/shared/labelValue'
import { noop } from '@/shared/lang'

export default function Select<Value extends string | number>({
  ariaControlsId,
  children,
  disabled = false,
  isPlaceholderSelectable = false,
  placeholder = 'Choisir',
  id,
  name,
  onChange,
  options,
  required = false,
}: Props<Value>): ReactElement {
  return (
    <div className="fr-select-group">
      <label
        className="fr-label"
        htmlFor={id}
      >
        {children}
      </label>
      <select
        className="fr-select fr-mb-2w"
        defaultValue={options.find(({ isSelected }) => Boolean(isSelected))?.value}
        disabled={disabled}
        id={id}
        name={name}
        onChange={onChange ?? noop}
        required={required}
      >
        <option
          hidden={!isPlaceholderSelectable}
          value=""
        >
          {placeholder}
        </option>
        {
          options.map((option): ReactElement => (
            <option
              aria-controls={ariaControlsId}
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))
        }
      </select>
    </div>
  )
}

type Props<Value extends string | number> = PropsWithChildren<Readonly<{
  ariaControlsId?: string
  disabled?: boolean
  id: string
  isPlaceholderSelectable?: boolean
  name: string
  onChange?: ChangeEventHandler<HTMLSelectElement>
  placeholder?: string
  options: ReadonlyArray<LabelValue<Value>>
  required?: boolean
}>>
