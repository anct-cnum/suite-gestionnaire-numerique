import { ReactElement } from 'react'

export default function Icon({ icon }: Props): ReactElement {
  return (
    <span
      aria-hidden="true"
      className={`fr-icon-${icon} icon-title fr-mr-3w color-blue-france`}
    />
  )
}

type Props = Readonly<{
  icon: string
}>
