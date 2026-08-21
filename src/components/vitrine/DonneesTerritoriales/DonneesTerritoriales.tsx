'use client'

import { useRouter } from 'next/navigation'
import { memo, ReactElement, useState } from 'react'

import styles from './DonneesTerritoriales.module.css'
import { rechercherTerritoires } from './rechercherTerritoires'
import RechercheTerritoire from '@/components/shared/Select/RechercheTerritoire'
import SpinnerSimple from '@/components/shared/Spinner/SpinnerSimple'
import CarteFranceVitrine from '@/components/vitrine/CarteFranceVitrine/CarteFranceVitrine'
import QuiSommesNous from '@/components/vitrine/QuiSommesNous/QuiSommesNous'
import SectionSources from '@/components/vitrine/SyntheseEtIndicateurs/SectionSources'
import { TerritoireViewModel } from '@/presenters/rechercheTerritoiresPresenter'

const MemoizedCarteFranceVitrine = memo(CarteFranceVitrine)

export default function DonneesTerritoriales(): ReactElement {
  const [navigationEnCours, setNavigationEnCours] = useState(false)

  const router = useRouter()

  function handleTerritoireChange(territoire: null | TerritoireViewModel): void {
    if (territoire !== null) {
      setNavigationEnCours(true)
      router.push(`/vitrine/donnees-territoriales/synthese-et-indicateurs/${territoire.type}/${territoire.code}`)
    }
  }

  return (
    <>
      {/* Section Découvrir les données */}
      <section style={{ backgroundColor: '#ffffff' }}>
        <div>
          <div className="fr-grid-row fr-grid-row--gutters">
            {/* Colonne gauche - Titre + Dropdown + Bouton */}
            <div className="fr-col-12 fr-col-lg-6">
              <div className={styles.colonneGauche}>
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
                    <RechercheTerritoire
                      id="rechercheTerritoire"
                      onSelectionner={handleTerritoireChange}
                      rechercher={rechercherTerritoires}
                    />
                  </div>

                  {/* Bouton ou loader pendant la navigation */}
                  {navigationEnCours ? (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <SpinnerSimple text="Chargement…" />
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <button
                        className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line"
                        onClick={() => {
                          setNavigationEnCours(true)
                          router.push('/vitrine/donnees-territoriales/synthese-et-indicateurs/national')
                        }}
                        type="button"
                      >
                        Voir les données nationales
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Colonne droite - Carte (masquée en mobile) */}
            <div className={`fr-col-12 fr-col-lg-6 ${styles.carteColonne}`}>
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
      <section className="fr-py-12w" style={{ backgroundColor: '#ffffff' }}>
        <div className="fr-container">
          <SectionSources />
        </div>
      </section>

      {/* Section Qui sommes-nous */}
      <QuiSommesNous />
    </>
  )
}
