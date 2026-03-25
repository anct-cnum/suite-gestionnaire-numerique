import { PropsWithChildren, ReactElement } from 'react'

export default function SubmitButton({
  ariaControls,
  children,
  className = '',
  isDisabled = false,
  title,
}: Props): ReactElement {
  return (
    <button
      aria-controls={ariaControls}
      className={`fr-btn ${className}`}
      disabled={isDisabled}
      title={title}
      type="submit"
    >
      {children}
    </button>
  )
}

type Props = PropsWithChildren<
  Readonly<{
    ariaControls?: string
    className?: string
    isDisabled?: boolean
    title?: string
  }>
>
