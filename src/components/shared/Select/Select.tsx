import { ChangeEventHandler, PropsWithChildren, ReactElement } from 'react'

export default function Select({
  ariaControlsId,
  children,
  defaultValue,
  id,
  name,
  onChange,
  options,
  required = false,
}: Props): ReactElement {
  return (
    <>
      <label
        className="fr-label"
        htmlFor={id}
      >
        {children}
      </label>
      <select
        className="fr-select fr-mb-2w"
        defaultValue={defaultValue}
        id={id}
        name={name}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...onChange ? { onChange } : {}}
        required={required}
      >
        {
          options.map((option): ReactElement => (
            <option
              aria-controls={ariaControlsId}
              key={option.uid}
              value={option.uid}
            >
              {option.label}
            </option>
          ))
        }
      </select>
    </>
  )
}

type Props = PropsWithChildren<Readonly<{
  ariaControlsId?: string
  defaultValue: string
  id: string
  name: string
  onChange?: ChangeEventHandler<HTMLSelectElement>
  options: ReadonlyArray<{
    label: string
    uid: string
  }>
  required?: boolean
}>>
