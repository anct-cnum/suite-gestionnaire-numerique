import { ReactElement, ReactNode } from 'react'

import { Header, Navigation } from '@/components/vitrine/DonneesTerritoriales'

export default function DonneesTerritoriales({ children }: Props): ReactElement {
  return (
    <>
      <Header titre="Données de l'inclusion numérique" />

      <div
        style={{
          backgroundColor: '#ffffff',
          display: 'flex',
          gap: '0px',
          width: '100%',
        }}
      >
        <aside
          style={{
            backgroundColor: '#ffffff',
            flexShrink: 0,
            width: '320px',
          }}
        >
          <Navigation />
        </aside>
        <div
          style={{
            flex: 1,
            paddingBottom: '80px',
            paddingLeft: '40px',
            paddingRight: '40px',
            paddingTop: '40px',
            width: '84%',
          }}
        >
          {children}
        </div>
      </div>
    </>
  )
}

type Props = Readonly<{
  children: ReactNode
}>
