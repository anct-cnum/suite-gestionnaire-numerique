import { PropsWithChildren, ReactElement } from 'react'

type LienExterneProps = PropsWithChildren<Readonly<{
  href: string
  className?: string
  title: string
}>>

export default function LienExterne({ children, className = '', href, title }: LienExterneProps): ReactElement {
  return (
    <a
      className={className}
      href={href}
      rel="noopener external noreferrer"
      target="_blank"
      title={`${title} - nouvelle fenêtre`}
    >
      {children}
    </a>
  )
}
