import Link from 'next/link'
import { PropsWithChildren, ReactElement } from 'react'

export default function Tag({ children, href }: Props): ReactElement {
  return (
    <Link
      className="fr-tag"
      href={href}
    >
      {children}
    </Link>
  )
}

type Props = PropsWithChildren<Readonly<{
  href: string
}>>
