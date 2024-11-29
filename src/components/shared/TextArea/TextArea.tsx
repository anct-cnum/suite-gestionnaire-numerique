import { PropsWithChildren, ReactElement } from 'react'

export default function TextArea({ children, id }: TextAreaProps): ReactElement {
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
        name="textarea"
      />
    </div>
  )
}

type TextAreaProps = PropsWithChildren<Readonly<{
  id: string
}>>
