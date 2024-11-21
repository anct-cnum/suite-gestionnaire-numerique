import { PropsWithChildren, ReactElement } from 'react'

export default function SubSectionButton({ children }: PropsWithChildren): ReactElement {
  return (
    <p className="fr-text--xs fr-mb-0 color-grey">
      {children}
    </p>
  )
}
