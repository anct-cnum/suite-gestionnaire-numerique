import { ReactElement, ReactNode } from 'react'

export default function Tag({ children }: TagProps): ReactElement {
  return (
    <a
      className="fr-tag"
      href="/"
    >
      {children}
    </a>
  )
}

interface TagProps {
  readonly children: ReactNode;
}
