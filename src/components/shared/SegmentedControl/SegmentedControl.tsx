import { PropsWithChildren, ReactElement } from 'react'

export default function SegmentedControl({ children, name, options }: Props): ReactElement {
  return (
    <fieldset className="fr-segmented fr-segmented--sm fr-mb-2w full-width">
      <legend className="fr-segmented__legend">
        {children}
      </legend>
      <div className="fr-segmented__elements full-width">
        {options.map(({ id, isChecked, label }) => (
          <div
            className="fr-segmented__element full-width"
            key={id}
          >
            <input
              defaultChecked={isChecked}
              id={id}
              name={name}
              type="radio"
              value={id}
            />
            <label
              className="fr-label justify-center"
              htmlFor={id}
            >
              {label}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  )
}

type Props = PropsWithChildren<Readonly<{
  name: string
  options: ReadonlyArray<{
    id: string
    isChecked: boolean
    label: string
  }>
}>>
