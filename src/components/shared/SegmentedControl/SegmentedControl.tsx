import { PropsWithChildren, ReactElement, useState } from 'react'

export default function SegmentedControl({ options, children, name }: SegmentedControlProps): ReactElement {
  const [checked, setChecked] = useState(options[0].id)

  return (
    <fieldset className="fr-segmented fr-segmented--sm fr-mb-2w full-width">
      <legend className="fr-segmented__legend">
        {children}
      </legend>
      <div className="fr-segmented__elements full-width">
        {options.map(({ label, id }) => (
          <div
            className="fr-segmented__element full-width"
            key={id}
          >
            <input
              checked={checked === id}
              id={id}
              name={name}
              onChange={(event) => {
                setChecked(event.target.value)
              }}
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

type SegmentedControlProps = PropsWithChildren<Readonly<{
  name: string
  options: ReadonlyArray<{
    label: string
    id: string
  }>
}>>
