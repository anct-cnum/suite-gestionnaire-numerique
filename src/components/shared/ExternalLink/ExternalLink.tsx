import { PropsWithChildren, ReactElement } from 'react'

export default function ExternalLink({ children, className = '', href, title }: ExternalLinkProps): ReactElement {
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

type ExternalLinkProps = PropsWithChildren<Readonly<{
  href: string
  className?: string
  title: string
}>>
