import { Metadata } from 'next'
import { ReactElement } from 'react'

import HeroSection from '@/components/vitrine/HeroSection/HeroSection'
import ToolCard from '@/components/vitrine/ToolCard/ToolCard'

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
        background="url(/vitrine/outils/hero.png) center/cover no-repeat"
        subtitle="Nunc enim pellentesque consectetur tempor Vel lobortis accumsan luctus viverra donec nisl ac."
        title="Les outils professionnels de l'inclusion numérique"
      />

      {/* Mon inclusion Numérique */}
      <ToolCard
        badge="DISPONIBLE"
        description="Ipsum mattis commodo purus varius. Tristique lacus urna interdum diam pretium enim. Dignissim nulla condimentum tellus et enim vestibulum. Molestie."
        icon="/vitrine/outils/icon-min.svg"
        imageAlt="Capture d'écran de Mon inclusion Numérique"
        imageBackground="#FFFFFF"
        imageSrc="/vitrine/outils/visuel-min.png"
        link="/vitrine/outils-numeriques/min"
        title="Mon inclusion Numérique"
      />

      {/* La Coop de la Médiation */}
      <ToolCard
        badge="DISPONIBLE"
        description="Ipsum mattis commodo purus varius. Tristique lacus urna interdum diam pretium enim. Dignissim nulla condimentum tellus et enim vestibulum. Molestie."
        icon="/vitrine/outils/icon-coop.svg"
        imageAlt="Capture d'écran de La Coop de la Médiation"
        imageBackground="#FFFFFF"
        imageSrc="/vitrine/outils/visuel-coop.png"
        link="https://lacoopdelamediation.numerique.gouv.fr/"
        title="La Coop de la Médiation"
      />

      {/* Tableau de pilotage Conseiller Numérique */}
      <ToolCard
        badge="DISPONIBLE"
        description="Ipsum mattis commodo purus varius. Tristique lacus urna interdum diam pretium enim. Dignissim nulla condimentum tellus et enim vestibulum. Molestie."
        imageAlt="Capture d'écran du Tableau de pilotage Conseiller Numérique"
        imageBackground="#FFFFFF"
        imageSrc="/vitrine/outils/visuel-cnfs.png"
        link="https://pilotage.conseiller-numerique.gouv.fr/"
        title="Tableau de pilotage Conseiller Numérique"
      />

      {/* Section Qui sommes-nous */}
      <section
        className="fr-py-12w"
        style={{ backgroundColor: '#f5f5fe' }}
      >
        <div className="fr-container">
          <div className="fr-grid-row fr-grid-row--center">
            <div className="fr-col-12 fr-col-md-10">
              {/* Logos RF + ANCT */}
              <div
                className="fr-mb-6w"
                style={{ textAlign: 'center' }}
              >
                <img
                  alt="République Française - ANCT Société Numérique"
                  src="/vitrine/accueil/logo-rf-anct.svg"
                  style={{
                    display: 'inline-block',
                    height: 'auto',
                    maxWidth: '384px',
                    width: '100%',
                  }}
                />
              </div>

              {/* Titre */}
              <h2
                className="fr-h2 fr-mb-6w"
                style={{ color: '#000091', textAlign: 'center' }}
              >
                Qui sommes nous ?
              </h2>

              {/* Paragraphes avec liens */}
              <p
                className="fr-text--md fr-mb-4w"
                style={{ textAlign: 'center' }}
              >
                Nous sommes l&apos;équipe du
                {' '}
                <a
                  className="fr-link"
                  href="https://societenumerique.gouv.fr/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Programme Société Numérique
                </a>
                {' '}
                qui porte la politique nationale d&apos;inclusion numérique, formalisée par une feuille
                de route co-écrite avec l&apos;ensemble des acteurs du secteur :
                {' '}
                <a
                  className="fr-link"
                  href="https://www.societenumerique.gouv.fr/nos-missions/france-numerique-ensemble"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  France Numérique Ensemble
                </a>
                {'. '}
              </p>
              <p
                className="fr-text--md fr-mb-4w"
                style={{ textAlign: 'center' }}
              >
                Le programme œuvre pour le développement d&apos;un numérique d&apos;intérêt
                général qui ambitionne d&apos;être ouvert, éthique, durable, souverain et,
                bien sûr, inclusif.
              </p>
              <p
                className="fr-text--md"
                style={{ textAlign: 'center' }}
              >
                Nous suivons l&apos;approche
                {' '}
                <a
                  className="fr-link"
                  href="https://beta.gouv.fr/approche"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  beta.gouv.fr
                </a>
                {' '}
                qui place l&apos;expérience utilisateur au coeur de la conception produit.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
