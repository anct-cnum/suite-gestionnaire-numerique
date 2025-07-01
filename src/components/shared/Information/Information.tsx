import { ReactElement } from 'react'

export default function Information({ label }: Props): ReactElement {
  return (
    <>
      {'\u00A0'}
      <span
        aria-label={label}
        className="fr-icon fr-icon-information-line color-blue-france"
        role="img"
        title={label}
      />
    </>
  )
}

type Props = Readonly<{
  label: string
}>
