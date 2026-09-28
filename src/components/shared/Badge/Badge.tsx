import { PropsWithChildren, ReactElement } from 'react'

export default function Badge({ children, color, icon = false, id, small = false }: Props): ReactElement {
  return (
    <p
      className={`fr-badge fr-badge--${color} ${icon ? '' : 'fr-badge--no-icon'} ${small ? 'fr-badge--sm' : ''} fr-m-1v`}
      id={id}
    >
      {children}
    </p>
  )
}

type Props = PropsWithChildren<
  Readonly<{
    color: string
    icon?: boolean
    id?: string
    small?: boolean
  }>
>
