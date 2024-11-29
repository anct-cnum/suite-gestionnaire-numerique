import { ReactElement, useState } from 'react'

export default function SegmentedControl({ options }: SegmentedControlProps): ReactElement {
  const [checked, setChecked] = useState<string | undefined>()

  return (
    <div className="fr-segmented fr-segmented--sm fr-mb-2w full-width">
      <div className="fr-segmented__elements full-width">
        {options.map(({ label, id }) => (
          <div
            className="fr-segmented__element full-width"
            key={id}
          >
            <input
              checked={checked === id}
              id={id}
              name={id}
              onChange={() => {
                setChecked(id)
              }}
              type="radio"
              value={id}
            />
            <label
              className="fr-label"
              htmlFor={id}
            >
              {label}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

type SegmentedControlProps = Readonly<{
  options: ReadonlyArray<{label: string, id: string}>
}>
