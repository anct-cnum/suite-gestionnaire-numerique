import { ReactElement } from 'react'

import Dot from '../shared/Dot/Dot'
import InformationDepliable, {
  BoutonInformation,
  TexteInformation,
} from '@/components/shared/Information/InformationDepliable'

export default function VentilationFinancements({
  contexte,
  nombreDeFinancementsEngagesParLEtat,
  ventilationSubventionsParEnveloppe,
}: Props): ReactElement {
  return (
    <>
      <InformationDepliable>
        <div className="fr-text--md fr-grid-row fr-grid-row--middle fr-mb-2w" style={{ fontWeight: 500 }}>
          {nombreDeFinancementsEngagesParLEtat} financement(s) engagé(s) par l&apos;État
          <BoutonInformation libelle="Plus d'information sur les financements engagés par l'État" />
        </div>
        <TexteInformation>
          <p className="fr-text--sm fr-mb-2w">
            {contexte === 'departement'
              ? 'Nombre de demandes de subventions validées des feuilles de route de votre gouvernance.'
              : 'Nombre de demandes de subventions validées des feuilles de route.'}
          </p>
        </TexteInformation>
      </InformationDepliable>
      <ul>
        {ventilationSubventionsParEnveloppe.map((detail) => (
          <li key={detail.label} style={{ listStyle: 'none' }}>
            <div style={{ alignItems: 'center', display: 'flex' }}>
              <div className="fr-text--sm fr-mb-1w" style={{ flex: '1 1 auto', fontWeight: 400, minWidth: 0 }}>
                <Dot color={detail.color} /> {detail.label}
              </div>
              <div
                className="fr-text--sm fr-mb-1w"
                style={{
                  fontWeight: 700,
                  marginLeft: '1rem',
                  marginRight: '1rem',
                  minWidth: '3rem',
                  textAlign: 'right',
                }}
              >
                {detail.total}
              </div>
              {contexte === 'admin' && (
                <div style={{ width: '6.25rem' }} title={`${detail.pourcentageConsomme}% de l'enveloppe consommée`}>
                  <div
                    className="fr-text--sm fr-mb-1w"
                    style={{
                      backgroundColor: 'var(--grey-900-175)',
                      borderRadius: '4px',
                      height: '8px',
                      width: '100%',
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: detail.couleurGraphique,
                        borderRadius: '4px',
                        height: '8px',
                        transition: 'width 0.3s ease',
                        width: `${Math.min(detail.pourcentageConsomme, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

type ContexteFinancement = 'admin' | 'departement'

type Props = Readonly<{
  contexte: ContexteFinancement
  nombreDeFinancementsEngagesParLEtat: number
  ventilationSubventionsParEnveloppe: ReadonlyArray<{
    color: string
    couleurGraphique: string
    label: string
    pourcentageConsomme: number
    total: string
  }>
}>
