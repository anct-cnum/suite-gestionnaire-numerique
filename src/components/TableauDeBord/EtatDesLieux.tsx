'use client'

import Link from 'next/link'
import { ReactElement, useEffect, useRef, useState } from 'react'

import Bar from '../shared/Bar/Bar'
import Carte from '../shared/Carte/Carte'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { CommuneFragilite } from '@/presenters/indiceFragilitePresenter'
import { TableauDeBordViewModel } from '@/presenters/tableauDeBordPresenter'

export default function EtatDesLieux({ 
  communesFragilite, 
  tableauDeBordViewModel, 
}: Props): ReactElement {
  const [isReady, setIsReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) {return undefined}

    let resizeTimeout: NodeJS.Timeout
    
    const resizeObserver = new ResizeObserver(() => {
      // Attendre que la taille se stabilise
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        setIsReady(true)
      }, 200)
    })

    resizeObserver.observe(containerRef.current)

    return (): void => {
      resizeObserver.disconnect()
      clearTimeout(resizeTimeout)
    }
  }, [])

  return (
    <section
      aria-labelledby="etatDesLieux"
      className="fr-mb-4w "
      ref={containerRef}
    >
      <div className="fr-grid-row fr-grid-row--middle space-between fr-pb-2w">
        <div className="fr-grid-row fr-grid-row--middle">
          <TitleIcon icon="france-line" />
          <div>
            <h2
              className="fr-h4 color-blue-france fr-m-0"
              id="etatDesLieux"
            >
              État des lieux de l&apos;inclusion numérique
            </h2>
            <p className="fr-m-0 font-weight-500">
              Données cumulées des dispositifs : Conseillers Numériques et Aidants Connect
            </p>
          </div>
        </div>
        <Link
          className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line"
          href="/lieux-inclusion"
        >
          Lieux d&apos;inclusion numérique
        </Link>
      </div>
      <div className="fr-grid-row">
        <div
          className="fr-col-8 background-blue-france"
          style={{ padding: 0 }}
        >
          <div
            className="fr-p-0w"
            style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '1rem',
              height: '100%',
            }}
          >
            <div style={{ padding: '1rem' }}>
              <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
                <div className="font-weight-700 color-blue-france">
                  Indice de Fragilité numérique
                </div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {/* On attend que le composant chart soit prêt  avant de charger la carte */}
              {isReady ? 
                <Carte
                  communesFragilite={communesFragilite}
                  departement={tableauDeBordViewModel.departement}
                /> : null}
            </div>
          </div>
        </div>
        <div className="fr-col-4">
          <div className="background-blue-france fr-p-4w fr-mb-1w fr-ml-1w">
            <div className="fr-h1 fr-m-0">
              <TitleIcon
                background="white"
                icon="map-pin-2-line"
              />
              {tableauDeBordViewModel.etatDesLieux.inclusionNumerique}
            </div>
            <div className="font-weight-500">
              Lieux d&apos;inclusion numérique
            </div>
            <div className="fr-text--xs color-blue-france fr-mb-0">
              Toutes les typologies de lieux publics ou privés
            </div>
          </div>
          <div className="background-blue-france fr-p-4w fr-mb-1w fr-ml-1w">
            <div className="fr-h1 fr-m-0">
              <TitleIcon
                background="white"
                icon="map-pin-user-line"
              />
              {tableauDeBordViewModel.etatDesLieux.mediateursEtAidants}
            </div>
            <div className="font-weight-500">
              Médiateurs et aidants numériques
            </div>
            <div className="fr-text--xs color-blue-france fr-mb-0">
              Conseillers numériques, coordinateurs, Aidants, …
            </div>
          </div>
          <div className="background-blue-france fr-p-4w fr-ml-1w">
            <div className="fr-h1 fr-m-0">
              <TitleIcon
                background="white"
                icon="compass-3-line"
              />
              {tableauDeBordViewModel.etatDesLieux.accompagnementRealise}
            </div>
            <div className="font-weight-500">
              Accompagnements réalisés
            </div>
            <div className="fr-text--xs color-blue-france fr-mb-0">
              Total cumulé des dispositifs
            </div>
            <Bar
              backgroundColor={tableauDeBordViewModel.etatDesLieux.graphique.backgroundColor}
              data={tableauDeBordViewModel.etatDesLieux.graphique.data}
              labels={tableauDeBordViewModel.etatDesLieux.graphique.labels}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

type Props = Readonly<{
  communesFragilite: Array<CommuneFragilite>
  tableauDeBordViewModel: TableauDeBordViewModel
}> 