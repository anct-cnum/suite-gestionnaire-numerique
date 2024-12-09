import { PropsWithChildren, ReactElement } from 'react'

export default function DrawerTitle({ children, id }: DrawerTitleProps): ReactElement {
  return (
    <h1
      className="color-blue-france fr-h2"
      id={id}
    >
      {children}
    </h1>
  )
}

type DrawerTitleProps = PropsWithChildren<Readonly<{
  id: string
}>>
