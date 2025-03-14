import { ChangeEventHandler, PropsWithChildren, ReactElement, RefObject, useId, useRef } from 'react'

import { noop } from '@/shared/lang'

export default function NumberInput({
  children,
  defaultValue = '',
  disabled = false,
  id,
  displayErrors = false,
  min = -Infinity,
  max = Infinity,
  name,
  onInput = noop,
  placeholder = '',
  ref = useRef<HTMLInputElement>(null),
  required = false,
}: Props): ReactElement {
  const [shouldDisplayErrors, onlyIf] = Array.isArray(displayErrors)
    ? displayErrors
    : [displayErrors, (): boolean => true]
  const errorTextId = useId()
  const input = ref.current
  const isInput = input !== null
  const isInvalid = isInput && !input.validity.valid
  const inputGroupDisabledStyle = disabled ? 'fr-input-group--disabled' : ''
  const [displayErrorText, inputGroupStyle] = isInvalid && shouldDisplayErrors
    ? [onlyIf?.(input) ?? true, 'fr-input-group--error']
    : [false, '']
  return (
    <div className={`fr-input-group input-group--sobre ${inputGroupDisabledStyle} ${inputGroupStyle}`}>
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
      <input
        aria-describedby={displayErrorText ? errorTextId : undefined}
        className="fr-input"
        defaultValue={defaultValue}
        disabled={disabled}
        id={id}
        max={max}
        min={min}
        name={name}
        onChange={onInput}
        placeholder={placeholder}
        ref={ref}
        required={required}
        type="number"
      />
      {
        displayErrorText ?
          <p
            className="fr-error-text"
            id={errorTextId}
          >
            {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion*/}
            {input!.validationMessage}
          </p> : null
      }
    </div>
  )
}

type Props = PropsWithChildren<Readonly<{
  defaultValue?: number | string
  disabled?: boolean
  id: string
  displayErrors?: false | [true, ((input: HTMLInputElement) => boolean)?]
  min?: number
  max?: number
  name: string
  placeholder?: string
  onInput?: ChangeEventHandler<HTMLInputElement>
  required?: boolean
  ref?: RefObject<HTMLInputElement | null>
}>>
