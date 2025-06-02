import { ChangeEventHandler, PropsWithChildren, ReactElement } from 'react'

import { noop } from '@/shared/lang'

export default function Radio({ children, id, isChecked, nomGroupe, onChange }: Props): ReactElement {
  return (
    <div className="fr-fieldset__element">
      <div className="fr-radio-group">
        <input
          checked={isChecked}
          id={id}
          name={nomGroupe}
          onChange={
            onChange ??
            // istanbul ignore next @preserve
            noop
          }
          required={true}
          type="radio"
          value={id}
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

type Props = PropsWithChildren<Readonly<{
  id: string
  isChecked: boolean
  nomGroupe: string
  onChange?: ChangeEventHandler<HTMLInputElement>
}>>
