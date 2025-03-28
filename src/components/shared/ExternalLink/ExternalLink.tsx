import { PropsWithChildren, ReactElement } from 'react'

export default function ExternalLink({ children, className = '', href, title }: Props): ReactElement {
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

type Props = PropsWithChildren<Readonly<{
  className?: string
  href: string
  title: string
}>>
