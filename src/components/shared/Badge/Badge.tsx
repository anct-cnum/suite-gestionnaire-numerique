import { PropsWithChildren, ReactElement } from 'react'

export default function Badge({ children, color, icon = false, small = false }: Props): ReactElement {
  return (
    <p
      className={`fr-badge fr-badge--${color} ${icon ? '' : 'fr-badge--no-icon'} ${small ? 'fr-badge--sm' :''} fr-m-1v`}
    >
      {children}
    </p>
  )
}

type Props = PropsWithChildren<Readonly<{
  color: string
  icon?: boolean
  small?: boolean
}>>
