'use client'

import { useRouter } from 'next/navigation'
import { memo, ReactElement, useEffect, useState } from 'react'

import CarteFranceVitrine from '@/components/vitrine/CarteFranceVitrine/CarteFranceVitrine'
import QuiSommesNous from '@/components/vitrine/QuiSommesNous/QuiSommesNous'
import SelecteurZoneGeographique from '@/components/vitrine/SelecteurZoneGeographique/SelecteurZoneGeographique'
import SectionSources from '@/components/vitrine/SyntheseEtIndicateurs/SectionSources'
import { ZoneGeographique } from '@/presenters/filtresUtilisateurPresenter'

const MemoizedCarteFranceVitrine = memo(CarteFranceVitrine)

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
        // eslint-disable-next-line sonarjs/no-unused-vars,@typescript-eslint/no-unused-vars
        const [_, codeDepartement] = value.split('_')

        // Ne naviguer que pour les départements, pas pour les régions
        if (type === 'departement' && codeDepartement !== '00') {
          router.push(`/vitrine/donnees-territoriales/synthese-et-indicateurs/${type}/${codeDepartement}`)
        }
      }
    }
  }, [router, zoneGeographique])

  return (
    <>
      {/* Section Découvrir les données */}
      <section
        style={{ backgroundColor: '#ffffff' }}
      >
        <div >
          <div className="fr-grid-row fr-grid-row--gutters">
            {/* Colonne gauche - Titre + Dropdown + Bouton */}
            <div className="fr-col-12 fr-col-lg-6">
              <div
                className="fr-py-6w fr-py-lg-0"
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: '639px',
                  padding: '0 1rem',
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
                  <h1
                    className="fr-h2 fr-mb-6w"
                    style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      lineHeight: '2.5rem',
                      textAlign: 'center',
                    }}
                  >
                    Découvrir les données publiques d&apos;Inclusion Numérique sur un territoire
                  </h1>

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

            {/* Colonne droite - Carte (masquée en mobile) */}
            <div className="fr-col-12 fr-col-lg-6 fr-hidden fr-unhidden-lg">
              <div
                style={{
                  backgroundColor: '#f5f5fe',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '639px',
                  padding: '2rem',
                }}
              >
                <MemoizedCarteFranceVitrine />
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
          <SectionSources />
        </div>
      </section>

      {/* Section Qui sommes-nous */}
      <QuiSommesNous />
    </>
  )
}
