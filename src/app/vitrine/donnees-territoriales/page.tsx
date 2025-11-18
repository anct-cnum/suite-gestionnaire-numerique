'use client'

import { useRouter } from 'next/navigation'
import { ReactElement, useEffect, useState } from 'react'

import QuiSommesNous from '@/components/vitrine/QuiSommesNous/QuiSommesNous'
import SelecteurZoneGeographique from '@/components/vitrine/SelecteurZoneGeographique/SelecteurZoneGeographique'
import { ZoneGeographique } from '@/presenters/filtresUtilisateurPresenter'

export default function DonneesTerritoriales(): ReactElement {
  const [ zoneGeographique, setZoneGeographique] = useState<undefined | ZoneGeographique>()

  const router = useRouter()

  useEffect(() => {
    if (zoneGeographique) {
      const { type, value } = zoneGeographique

      // Si la valeur est "all", naviguer vers /national
      if (value === 'all') {
        router.push('/vitrine/donnees-territoriales/synthese-et-indicateurs/national')
        return
      }

      // Si la valeur contient un underscore, extraire le code région et département
      if (value.includes('_')) {
        const [codeRegion, codeDepartement] = value.split('_')

        if (type === 'region') {
          router.push(`/vitrine/donnees-territoriales/synthese-et-indicateurs/${type}/${codeRegion}`)
        } else {
          router.push(`/vitrine/donnees-territoriales/synthese-et-indicateurs/${type}/${codeDepartement}`)
        }
      }
    }
  }, [router, zoneGeographique])

  return (
    <>
      {/* Section Découvrir les données */}
      <section
        className="fr-py-8w"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="fr-container">
          <div className="fr-grid-row fr-grid-row--gutters">
            {/* Colonne gauche - Titre + Dropdown + Bouton */}
            <div className="fr-col-12 fr-col-lg-6">
              <div
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: '639px',
                  padding: '0 2rem',
                }}
              >
                <div style={{ maxWidth: '512px', width: '100%' }}>
                  {/* Image France miniature */}
                  <div
                    className="fr-mb-4w"
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      alt="Carte de France miniature"
                      src="/vitrine/donnees-territoriales/france-miniature.png"
                      style={{
                        height: '53px',
                        width: 'auto',
                      }}
                    />
                  </div>

                  {/* Titre */}
                  <h2
                    className="fr-h2 fr-mb-6w"
                    style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      lineHeight: '2.5rem',
                      textAlign: 'center',
                    }}
                  >
                    Découvrir les données publiques d&apos;Inclusion Numérique sur un territoire
                  </h2>

                  {/* Selecteur de territoire */}
                  <div className="fr-mb-4w">
                    <SelecteurZoneGeographique onChange={setZoneGeographique} />
                  </div>

                  {/* Bouton */}
                  <div style={{ textAlign: 'center' }}>
                    <button
                      className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line"
                      onClick={() => { router.push('/vitrine/donnees-territoriales/synthese-et-indicateurs/national') }}
                      type="button"
                    >
                      Voir les données nationale
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite - Carte */}
            <div className="fr-col-12 fr-col-lg-6">
              <div
                style={{
                  alignItems: 'center',
                  backgroundColor: '#f5f5fe',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: '639px',
                  padding: '0 2rem',
                }}
              >
                {/* Espace réservé pour la carte */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Séparateur */}
      <div
        style={{
          backgroundColor: '#e5e5e5',
          height: '1px',
          margin: '0 auto',
          width: '100%',
        }}
      />

      {/* Section Sources et données utilisées */}
      <section
        className="fr-py-12w"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="fr-container">
          {/* Header avec icône */}
          <div
            className="fr-mb-6w"
            style={{ textAlign: 'center' }}
          >
            <div
              className="fr-mb-4w"
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <img
                alt="Icône plateforme de données"
                src="/vitrine/donnees-territoriales/logo-source.png"
                style={{
                  height: '80px',
                  width: 'auto',
                }}
              />
            </div>
            <h2
              className="fr-h2 fr-mb-4w"
              style={{ color: '#000091' }}
            >
              Sources et données utilisées
            </h2>
            <p
              className="fr-text--md"
              style={{
                color: '#666',
                marginLeft: 'auto',
                marginRight: 'auto',
                maxWidth: '792px',
              }}
            >
              Mon Inclusion Numérique est un outil connecté à différents dispositifs liés à
              l&apos;inclusion numérique
            </p>
          </div>

          {/* Grille de cartes */}
          <div className="fr-grid-row fr-grid-row--gutters">
            {/* Ligne 1 - 3 cartes */}
            {/* La Coop de la Médiation numérique */}
            <div className="fr-col-12 fr-col-md-6 fr-col-lg-4">
              <div
                className="fr-p-4w"
                style={{
                  backgroundColor: '#f5f5fe',
                  borderRadius: '8px',
                  height: '100%',
                }}
              >
                <div className="fr-mb-3w">
                  <img
                    alt="Logo La Coop"
                    src="/vitrine/accueil/logo-coop.png"
                    style={{
                      height: '88px',
                      width: '88px',
                    }}
                  />
                </div>
                <h3
                  className="fr-h6 fr-mb-2w"
                  style={{ fontSize: '1.125rem' }}
                >
                  La Coop de la Médiation numérique
                </h3>
                <p
                  className="fr-text--sm fr-mb-3w"
                  style={{ color: '#666' }}
                >
                  Lorem ipsum dolor sit amet consectetur. Diam molestie tellus ut tempus augue in.
                </p>
                <a
                  className="fr-link fr-link--icon-right fr-icon-arrow-right-line"
                  href="https://coop-numerique.anct.gouv.fr/"
                >
                  Découvrir
                </a>
              </div>
            </div>

            {/* La Cartographie Nationale */}
            <div className="fr-col-12 fr-col-md-6 fr-col-lg-4">
              <div
                className="fr-p-4w"
                style={{
                  backgroundColor: '#f5f5fe',
                  borderRadius: '8px',
                  height: '100%',
                }}
              >
                <div className="fr-mb-3w">
                  <img
                    alt="Logo Cartographie Nationale"
                    src="/vitrine/accueil/logo-carto.png"
                    style={{
                      height: '88px',
                      width: '88px',
                    }}
                  />
                </div>
                <h3
                  className="fr-h6 fr-mb-2w"
                  style={{ fontSize: '1.125rem' }}
                >
                  La Cartographie Nationale des lieux d&apos;inclusion numérique
                </h3>
                <p
                  className="fr-text--sm fr-mb-3w"
                  style={{ color: '#666' }}
                >
                  Lorem ipsum dolor sit amet consectetur. Diam molestie
                </p>
                <a
                  className="fr-link fr-link--icon-right fr-icon-arrow-right-line"
                  href="https://cartographie.societenumerique.gouv.fr/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Découvrir
                </a>
              </div>
            </div>

            {/* Aidants Connect */}
            <div className="fr-col-12 fr-col-md-6 fr-col-lg-4">
              <div
                className="fr-p-4w"
                style={{
                  backgroundColor: '#f5f5fe',
                  borderRadius: '8px',
                  height: '100%',
                }}
              >
                <div className="fr-mb-3w">
                  <img
                    alt="Logo Aidants Connect"
                    src="/vitrine/accueil/logo-aidants-connect.png"
                    style={{
                      height: '88px',
                      width: '88px',
                    }}
                  />
                </div>
                <h3
                  className="fr-h6 fr-mb-2w"
                  style={{ fontSize: '1.125rem' }}
                >
                  Aidants Connect
                </h3>
                <p
                  className="fr-text--sm fr-mb-3w"
                  style={{ color: '#666' }}
                >
                  Lorem ipsum dolor sit amet consectetur. Diam molestie tellus ut tempus augue in.
                </p>
                <a
                  className="fr-link fr-link--icon-right fr-icon-arrow-right-line"
                  href="https://aidantsconnect.beta.gouv.fr/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Découvrir
                </a>
              </div>
            </div>

            {/* Ligne 2 - 2 cartes */}
            {/* Conseiller Numérique */}
            <div className="fr-col-12 fr-col-md-6 fr-col-lg-4">
              <div
                className="fr-p-4w"
                style={{
                  backgroundColor: '#f5f5fe',
                  borderRadius: '8px',
                  height: '100%',
                }}
              >
                <div className="fr-mb-3w">
                  <img
                    alt="Logo Conseiller Numérique"
                    src="/vitrine/accueil/logo-conseillers-numeriques.png"
                    style={{
                      height: '88px',
                      width: '88px',
                    }}
                  />
                </div>
                <h3
                  className="fr-h6 fr-mb-2w"
                  style={{ fontSize: '1.125rem' }}
                >
                  Conseiller Numérique
                </h3>
                <p
                  className="fr-text--sm fr-mb-3w"
                  style={{ color: '#666' }}
                >
                  Lorem ipsum dolor sit amet consectetur. Diam molestie tellus ut tempus augue in.
                </p>
              </div>
            </div>

            {/* France Service */}
            <div className="fr-col-12 fr-col-md-6 fr-col-lg-4">
              <div
                className="fr-p-4w"
                style={{
                  backgroundColor: '#f5f5fe',
                  borderRadius: '8px',
                  height: '100%',
                }}
              >
                <div className="fr-mb-3w">
                  <div
                    style={{
                      alignItems: 'center',
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      display: 'flex',
                      height: '88px',
                      justifyContent: 'center',
                      width: '88px',
                    }}
                  >
                    <img
                      alt="Logo France Service"
                      src="/vitrine/donnees-territoriales/logo-france-service.png"
                      style={{
                        height: 'auto',
                        maxHeight: '48px',
                        maxWidth: '48px',
                        width: 'auto',
                      }}
                    />
                  </div>
                </div>
                <h3
                  className="fr-h6 fr-mb-2w"
                  style={{ fontSize: '1.125rem' }}
                >
                  France Service
                </h3>
                <p
                  className="fr-text--sm fr-mb-3w"
                  style={{ color: '#666' }}
                >
                  Lorem ipsum dolor sit amet consectetur. Diam molestie tellus ut tempus augue in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Qui sommes-nous */}
      <QuiSommesNous />
    </>
  )
}
