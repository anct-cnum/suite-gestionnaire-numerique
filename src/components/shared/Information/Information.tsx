import { ReactElement } from 'react'

export default function Information({ label }: Props): ReactElement {
  return (
    <>
      {'\u00A0'}
      <span
        aria-label={label}
        className="fr-icon fr-icon-information-line fr-p-0 fr-btn--sm color-blue-france"
        role="img"
        title={label}
      />
    </>
  )
}

type Props = Readonly<{
  label: string
}>
