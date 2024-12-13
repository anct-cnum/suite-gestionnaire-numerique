import { ReactElement } from 'react'

export default function SubmitButton({ isDisabled, label }: Props): ReactElement {
  return (
    <button
      className="fr-btn"
      disabled={isDisabled}
      type="submit"
    >
      {label}
    </button>
  )
}

type Props = Readonly<{
  isDisabled: boolean
  label: string
}>
