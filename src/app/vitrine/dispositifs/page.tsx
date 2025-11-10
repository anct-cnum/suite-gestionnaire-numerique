import { Metadata } from 'next'
import { ReactElement } from 'react'

import HeroSection from '@/components/vitrine/HeroSection/HeroSection'

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
}

export default function DispositifsPage(): ReactElement {
  return (
    <>
      <HeroSection
        subtitle="Les dispositifs nationaux pour l'inclusion numérique"
        title="Dispositifs"
      />

      {/* Content Section */}
      <section className="fr-py-8w">
        <div className="fr-container">
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12">
              <h2 className="fr-h2 fr-mb-4w">
                Les dispositifs de l&apos;inclusion numérique
              </h2>
              <p className="fr-text--md fr-mb-4w">
                Cette page présentera les différents dispositifs déployés sur le territoire :
                Conseillers numériques, Pass numériques, Aidants Connect, Hub territoriaux, etc.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
