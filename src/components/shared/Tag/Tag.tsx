import Link from 'next/link'
import { PropsWithChildren, ReactElement } from 'react'

export default function Tag({ children }: Readonly<PropsWithChildren>): ReactElement {
  return (
    <Link
      className="fr-tag"
      href="/"
    >
      {children}
    </Link>
  )
}
