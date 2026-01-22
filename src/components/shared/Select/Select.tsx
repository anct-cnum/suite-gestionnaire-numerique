import { ChangeEventHandler, PropsWithChildren, ReactElement } from 'react'

import { LabelValue } from '@/presenters/shared/labels'
import { noop } from '@/shared/lang'

export default function Select<Value extends number | string>({
  ariaControlsId,
  children,
  disabled = false,
  id,
  isPlaceholderSelectable = false,
  name,
  onChange,
  options,
  placeholder = 'Choisir',
  required = false,
  value,
}: Props<Value>): ReactElement {
  const defaultVal = options.find(({ isSelected }) => Boolean(isSelected))?.value
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
        defaultValue={value === undefined ? defaultVal : undefined}
        disabled={disabled}
        id={id}
        name={name}
        onChange={onChange ?? noop}
        required={required}
        value={value}
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

type Props<Value extends number | string> = PropsWithChildren<Readonly<{
  ariaControlsId?: string
  disabled?: boolean
  id: string
  isPlaceholderSelectable?: boolean
  name: string
  onChange?: ChangeEventHandler<HTMLSelectElement>
  options: ReadonlyArray<LabelValue<Value>>
  placeholder?: string
  required?: boolean
  value?: Value
}>>
