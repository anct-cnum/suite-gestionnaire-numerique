import { ReactElement } from 'react'

export default function SubmitButton({ ariaControls = undefined, className = '', isDisabled = false, label, title = undefined }: Props): ReactElement {
  return (
    <button
      aria-controls={ariaControls}
      className={`fr-btn ${className}`}
      disabled={isDisabled}
      title={title}
      type="submit"
    >
      {label}
    </button>
  )
}

type Props = Readonly<{
  ariaControls?: string
  className?: string
  isDisabled?: boolean
  label: string
  title?: string
}>
