import { PropsWithChildren, ReactElement } from 'react'

export default function ModalTitle({ children, id }: Props): ReactElement {
  return (
    <h1
      className="fr-modal__title"
      id={id}
    >
      {children}
    </h1>
  )
}

type Props = PropsWithChildren<Readonly<{
  id: string
}>>
