import { PropsWithChildren, ReactElement } from 'react'

export default function SubSectionTitle({ children }: Readonly<PropsWithChildren>): ReactElement {
  return (
    <p className="font-weight-700 fr-mb-0">
      {children}
    </p>
  )
}
