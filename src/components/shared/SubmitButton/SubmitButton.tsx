import { ReactElement } from 'react'

export default function SubmitButton({ isDisabled, label }: SubmitButtonProps): ReactElement {
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

type SubmitButtonProps = Readonly<{
  isDisabled: boolean
  label: string
}>
