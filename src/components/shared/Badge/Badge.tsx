import { PropsWithChildren, ReactElement } from 'react'

export default function Badge({ children, color, icon = false }: Props): ReactElement {
  return (
    <p
      className={`fr-badge fr-badge--${color} ${icon ? '' : 'fr-badge--no-icon'} fr-m-1v`}
    >
      {children}
    </p>
  )
}

type Props = PropsWithChildren<Readonly<{
  color: string
  icon?: boolean
}>>
