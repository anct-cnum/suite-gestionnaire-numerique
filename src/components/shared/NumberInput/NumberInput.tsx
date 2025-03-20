import { FormEvent, PropsWithChildren, ReactElement, RefObject, useId, useRef, useState } from 'react'

export default function NumberInput({
  children,
  defaultValue,
  disabled = false,
  id,
  displayValidationMessage,
  icon,
  min,
  max,
  name,
  onInput,
  placeholder = '',
  ref = useRef<HTMLInputElement>(null),
  required = false,
}: Props): ReactElement {
  const errorTextId = useId()
  const iconId = useId()
  // Stryker disable next-line BooleanLiteral
  const [isPristine, setIsPristine] = useState(true)

  const input = ref.current
  const isInvalid = !(input === null || isPristine || input.validity.valid)
  const isIcon = Boolean(icon)
  const inputGroupDisabledStyle = disabled ? 'fr-input-group--disabled' : ''
  const iconClass = isIcon ? `fr-icon-${icon}` : ''
  const displayErrorText = isInvalid && Boolean(displayValidationMessage?.(input))
  const inputGroupStyle = isInvalid ? 'fr-input-group--error' : ''

  return (
    <div className={`fr-input-group input-group--custom-success-error ${inputGroupDisabledStyle} ${inputGroupStyle}`}>
      <label
        className="fr-label"
        htmlFor={id}
      >
        {children}
        {
          required ? (
            <>
              {' '}
              <span className="color-red">
                *
              </span>
            </>
          ) : null
        }
      </label>
      <div className={`fr-input-wrap ${iconClass}`}>
        <input
          aria-describedby={displayErrorText ? errorTextId : undefined}
          className="fr-input"
          defaultValue={defaultValue}
          disabled={disabled}
          id={id}
          max={max}
          min={min}
          name={name}
          onInput={(event) => {
            onInput(event)
            setIsPristine(false)
          }}
          placeholder={placeholder}
          ref={ref}
          required={required}
          type="number"
        />
        {
          isIcon ?
            <div
              aria-live="assertive"
              className="fr-messages-group"
              id={iconId}
            />
            : null
        }
      </div>
      {
        displayErrorText ?
          <p
            className="fr-error-text"
            id={errorTextId}
          >
            {}
            {input.validationMessage}
          </p> : null
      }
    </div>
  )
}

type Props = PropsWithChildren<Readonly<{
  defaultValue?: number
  disabled?: boolean
  id: string
  icon?: string
  min?: number
  max?: number
  name: string
  placeholder?: string
  required?: boolean
  ref?: RefObject<HTMLInputElement | null>
  displayValidationMessage?(input: HTMLInputElement): boolean
  onInput(event: FormEvent<HTMLInputElement>): void
}>>
