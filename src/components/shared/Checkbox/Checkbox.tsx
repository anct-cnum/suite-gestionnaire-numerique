import React, { ChangeEvent, PropsWithChildren, ReactElement } from 'react'

import { LabelValue } from '@/presenters/shared/labels'

export default function Checkbox({
  children,
  id,
  isSelected,
  label,
  onChange,
  value,
}: Props): ReactElement {
  return (
    <div className="fr-fieldset__element">
      <div className="fr-checkbox-group">
        <input
          defaultChecked={isSelected}
          id={id}
          name={label}
          onChange={onChange}
          type="checkbox"
          value={value}
        />
        <label
          className="fr-label"
          htmlFor={id}
        >
          {children}
        </label>
      </div>
    </div>
  )
}

type Props = PropsWithChildren<LabelValue & Readonly<{
  id: string
  onChange?(event: ChangeEvent<HTMLInputElement>): void
}>>
