import { PropsWithChildren, ReactElement } from 'react'

export default function TableauVide({ children }: Props): ReactElement {
  return (
    <div
      style={{
        backgroundColor: 'var(--brown-caramel-975-75)',
        borderRadius: '1rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <p className="fr-text--md fr-mb-0">{children}</p>
    </div>
  )
}

type Props = Readonly<PropsWithChildren>
