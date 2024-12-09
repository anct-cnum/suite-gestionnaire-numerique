import { ReactElement } from 'react'

export default function Icon({ icon }: IconProps): ReactElement {
  return (
    <span
      aria-hidden="true"
      className={`fr-icon-${icon} fr-mr-1w`}
    />
  )
}

type IconProps = Readonly<{
  icon: string
}>
