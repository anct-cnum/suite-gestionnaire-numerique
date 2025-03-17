import { ReactElement, ReactNode } from 'react'

export default function InformationPersonnelle({ label, value }: Props): ReactElement {
  return (
    <div className="fr-col-12 fr-col-md-6">
      <div className="color-grey">
        {label}
      </div>
      <div className="font-weight-500">
        {value}
      </div>
    </div>
  )
}

type Props = Readonly<{
  label: ReactNode
  value: string
}>
