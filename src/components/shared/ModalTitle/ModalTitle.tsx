import { PropsWithChildren, ReactElement } from 'react'

export default function ModalTitle({ children, id }: ModalTitleProps): ReactElement {
  return (
    <h1
      className="fr-modal__title"
      id={id}
    >
      {children}
    </h1>
  )
}

type ModalTitleProps = PropsWithChildren<Readonly<{
  id: string
}>>
