import { ReactElement } from 'react'

export default function Icon({ icon }: Props): ReactElement {
  return (
    <span
      aria-hidden="true"
      className={`fr-icon-${icon} fr-mr-1w`}
    />
  )
}

type Props = Readonly<{
  icon: string
}>
