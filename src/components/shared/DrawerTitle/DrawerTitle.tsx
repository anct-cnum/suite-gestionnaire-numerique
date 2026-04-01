import { PropsWithChildren, ReactElement } from 'react'

export default function DrawerTitle({ children, id }: Props): ReactElement {
  return (
    <h3 className="color-blue-france fr-h3 fr-mb-2w" id={id}>
      {children}
    </h3>
  )
}

type Props = PropsWithChildren<
  Readonly<{
    id: string
  }>
>
