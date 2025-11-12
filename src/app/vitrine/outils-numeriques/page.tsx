import { Metadata } from 'next'
import { ReactElement } from 'react'

import HeroSection from '@/components/vitrine/HeroSection/HeroSection'

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
}

export default function OutilsNumeriquesPage(): ReactElement {
  return (
    <>
      <HeroSection
        subtitle="Les outils pour les professionnels de l'inclusion numérique"
        title="Outils numériques"
      />

      {/* Content Section */}
      <section className="fr-py-8w">
        <div className="fr-container">
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12">
              <h2 className="fr-h2 fr-mb-4w">
                Des outils pour accompagner les acteurs
              </h2>
              <p className="fr-text--md fr-mb-4w">
                Cette page présentera l&apos;outillage méthodologique pour accompagner les collectivités :
                diagnostic Hubs territoriaux, outils pour cartographier, animer, suivre les actions, etc.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
