import { ReactElement, ReactNode } from 'react'

export default function BlocCard({ children, labelledBy }: Props): ReactElement {
  return (
    <section aria-labelledby={labelledBy} className="fr-mb-4w grey-border border-radius fr-p-4w">
      {children}
    </section>
  )
}

type Props = Readonly<{
  children: ReactNode
  labelledBy: string
}>
