import { PropsWithChildren, ReactElement } from 'react'

export default function TextArea({ children, id, maxLength }: Props): ReactElement {
  return (
    <div className="fr-input-group">
      <label
        className="fr-label"
        htmlFor={id}
      >
        {children}
      </label>
      <textarea
        className="fr-input"
        id={id}
        maxLength={maxLength}
        name="textarea"
      />
    </div>
  )
}

type Props = PropsWithChildren<Readonly<{
  id: string,
  maxLength?: number
}>>
