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
        <div
          style={{
            backgroundColor: '#ffffff',
            minHeight: '756px',
            paddingBottom: '40px',
            paddingLeft: '80px',
            paddingRight: '0px',
            paddingTop: '40px',
            width: '16%',
          }}
        >
          <Navigation />
        </div>
        <div
          style={{
            paddingBottom: '80px',
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
