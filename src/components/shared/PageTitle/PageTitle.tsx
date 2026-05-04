import { PropsWithChildren, ReactElement } from 'react'

export default function PageTitle({ children, margin = 'fr-mt-5w' }: Props): ReactElement {
  return (
    <h1 className={`color-blue-france ${margin}`} style={{ fontSize: '2.25rem', lineHeight: '2.5rem' }}>
      {children}
    </h1>
  )
}

type Props = PropsWithChildren<
  Readonly<{
    margin?: string
  }>
>
