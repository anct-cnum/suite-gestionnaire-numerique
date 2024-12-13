import { ChangeEventHandler, PropsWithChildren, ReactElement } from 'react'

export default function Radio({ children, id, nomGroupe, onChange }: Props): ReactElement {
  return (
    <div className="fr-fieldset__element">
      <div className="fr-radio-group">
        <input
          id={id}
          name={nomGroupe}
          onChange={onChange}
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
  nomGroupe: string
  onChange: ChangeEventHandler<HTMLInputElement>
}>>
