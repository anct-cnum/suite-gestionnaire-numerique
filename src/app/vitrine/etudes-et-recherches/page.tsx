import { Metadata } from 'next'
import { ReactElement } from 'react'

import HeroSection from '@/components/vitrine/HeroSection/HeroSection'
import QuiSommesNous from '@/components/vitrine/QuiSommesNous/QuiSommesNous'

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
}

export default function EtudesEtRecherchesPage(): ReactElement {
  return (
    <>
      <HeroSection
        subtitle="Les études et recherches sur l'inclusion numérique"
        title="Etudes et recherches"
      />

      {/* Content Section */}
      <section className="fr-py-8w">
        <div className="fr-container">
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12">
              <h2 className="fr-h2 fr-mb-4w">
                Etudes, recherches et publications
              </h2>
              <p className="fr-text--md fr-mb-4w">
                Cette page présentera les études, données, recherches, baromètres et publications
                pour mieux comprendre les enjeux de l&apos;inclusion numérique.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Qui sommes-nous */}
      <QuiSommesNous />
    </>
  )
}
