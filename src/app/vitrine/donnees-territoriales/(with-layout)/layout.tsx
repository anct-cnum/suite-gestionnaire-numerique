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
            width: '320px',
          }}
        >
          <Navigation />
        </div>
        <div
          style={{
            minHeight: '756px',
            paddingBottom: '80px',
            paddingLeft: '40px',
            paddingRight: '112px',
            paddingTop: '40px',
            width: '1120px',
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
