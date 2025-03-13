import React, { PropsWithChildren, ReactElement } from 'react'

import { LabelValue } from '@/presenters/shared/labelValue'

export default function Checkbox({
  children,
  isSelected,
  id,
  label,
  value,
}: Props): ReactElement {
  return (
    <div className="fr-fieldset__element">
      <div className="fr-checkbox-group">
        <input
          defaultChecked={isSelected}
          id={id}
          name={label}
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

type Props = PropsWithChildren<LabelValue & Readonly<{ id: string }>>
