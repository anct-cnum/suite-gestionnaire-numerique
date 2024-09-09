import { PropsWithChildren, ReactElement } from 'react'

export default function Badge({ children, color }: BadgeProps): ReactElement {
  return (
    <p className={`fr-badge fr-badge--${color}`}>
      {children}
    </p>
  )
}

type BadgeProps = PropsWithChildren<Readonly<{
  color: string
}>>
