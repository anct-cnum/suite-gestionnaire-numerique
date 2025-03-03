import { ReactElement } from 'react'

export default function Icon({ classname = '', icon }: Props): ReactElement {
  return (
    <span
      aria-hidden="true"
      className={`fr-icon-${icon} ${classname}`}
    />
  )
}

type Props = Readonly<{
  classname?: string
  icon: string
}>
