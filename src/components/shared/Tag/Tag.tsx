import Link from 'next/link'
import { PropsWithChildren, ReactElement } from 'react'

export default function Tag({ children, href, target = '_self' }: Props): ReactElement {
  return (
    <Link
      className="fr-tag fr-m-1v"
      href={href}
      target={target}
    >
      {children}
    </Link>
  )
}

type Props = PropsWithChildren<Readonly<{
  href: string
  target?: string
}>>
