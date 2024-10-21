import { PropsWithChildren, ReactElement } from 'react'

export default function Radio({ children, id, nomGroupe }: RadioProps): ReactElement {
  return (
    <div className="fr-fieldset__element">
      <div className="fr-radio-group">
        <input
          id={id}
          name={nomGroupe}
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

type RadioProps = PropsWithChildren<Readonly<{
  id: string
  nomGroupe: string
}>>
