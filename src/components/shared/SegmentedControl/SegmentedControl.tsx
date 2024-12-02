import { ReactElement } from 'react'

export default function SegmentedControl({ options, children, name }: SegmentedControlProps): ReactElement {

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

type SegmentedControlProps = Readonly<{
  options: ReadonlyArray<{
    label: string,
    id: string
  }>
  children: ReactElement
  name: string
}>
