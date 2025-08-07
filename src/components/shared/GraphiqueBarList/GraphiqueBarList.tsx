import React from 'react'

export default function GraphiqueBarList(props: Props): React.ReactElement {
  const { elements } = props
  const max = Math.max(...elements.map((item) => item.value))
  return (
    <div >
      {elements.map((item) => (
        <div
          className="fr-grid-row fr-grid-row--middle"
          key={item.label}
        >
          <div
            className="fr-col-7 fr-mb-0 fr-text--sm"
          >
            {item.label}
          </div>

          <div
            className="fr-col-1 fr-mb-0 fr-mr-1w fr-text--sm fr-text--bold"
            style={{
              textAlign: 'right',
            }}
          >
            {item.value}
          </div>

          <div
            className="fr-col-3"
          >
            <div
              style={{
                backgroundColor: 'var(--blue-france-main-525)',
                borderRadius: '4px',
                height: '8px',
                transition: 'width 0.3s ease',
                width: `${item.value / max * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

type BarElement = {
  label: string
  value: number
}
type Props = {
  readonly elements: Array<BarElement>
}
