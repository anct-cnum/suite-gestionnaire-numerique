import Link from 'next/link'
import { PropsWithChildren, ReactElement } from 'react'

export default function Tag({ children }: PropsWithChildren): ReactElement {
  return (
    <Link
      className="fr-tag"
      href="/"
    >
      {children}
    </Link>
  )
}
