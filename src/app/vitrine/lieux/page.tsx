import { Metadata } from 'next'
import { ReactElement } from 'react'

import HeroSection from '@/components/vitrine/HeroSection/HeroSection'

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
}

export default function LieuxPage(): ReactElement {
  return (
    <>
      <HeroSection
        subtitle="Découvrez les lieux d'inclusion numérique sur tout le territoire français"
        title="Lieux d'inclusion numérique"
      />

      {/* Content Section */}
      <section className="fr-py-8w">
        <div className="fr-container">
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12">
              <h2 className="fr-h2 fr-mb-4w">
                Les lieux d&apos;inclusion numérique
              </h2>
              <p className="fr-text--md fr-mb-4w">
                Cette page présentera la cartographie des lieux d&apos;inclusion numérique :
                France Services, maisons France Services, espaces publics numériques, tiers-lieux, etc.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
