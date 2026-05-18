import { PropsWithChildren, ReactElement } from 'react'

export default function SubmitButton({
  ariaControls,
  children,
  className = '',
  form,
  isDisabled = false,
  title,
}: Props): ReactElement {
  return (
    <button
      aria-controls={ariaControls}
      className={`fr-btn ${className}`}
      disabled={isDisabled}
      form={form}
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
    form?: string
    isDisabled?: boolean
    title?: string
  }>
>
