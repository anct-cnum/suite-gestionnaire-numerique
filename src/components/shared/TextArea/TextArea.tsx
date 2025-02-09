import { PropsWithChildren, ReactElement, useId } from 'react'

export default function TextArea({ children, defaultValue = '', maxLength }: Props): ReactElement {
  const id = useId()

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
        defaultValue={defaultValue}
        id={id}
        maxLength={maxLength}
        name="textarea"
        rows={5}
      />
    </div>
  )
}

type Props = PropsWithChildren<Readonly<{
  defaultValue?: string
  maxLength?: number
}>>
