import { Metadata } from 'next'
import { ReactElement } from 'react'

import HeroSection from '@/components/vitrine/HeroSection/HeroSection'

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
}

export default function DonneesTerritoriales(): ReactElement {
  return (
    <>
      <HeroSection
        subtitle="Les données de l'inclusion numérique par territoire"
        title="Données territoriales"
      />

      {/* Content Section */}
      <section className="fr-py-8w">
        <div className="fr-container">
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12">
              <h2 className="fr-h2 fr-mb-4w">
                Données territoriales de l&apos;inclusion numérique
              </h2>
              <p className="fr-text--md fr-mb-4w">
                Cette page présentera les données territorialisées : diagnostics territoriaux,
                statistiques par département et région, indicateurs locaux, etc.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
