import { PropsWithChildren, ReactElement } from 'react'

export default function Layout({ children }: Readonly<PropsWithChildren>): ReactElement {
  return (
    <main>
      {children}
    </main>
  )
}
