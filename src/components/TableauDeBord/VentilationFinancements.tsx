import { ReactElement } from 'react'

import Dot from '../shared/Dot/Dot'
import Information from '@/components/shared/Information/Information'

export default function VentilationFinancements({ 
  contexte,
  nombreDeFinancementsEngagesParLEtat,
  ventilationSubventionsParEnveloppe,
}: Props): ReactElement {
  return (
    <>
      <div
        className="fr-text--md fr-grid-row fr-grid-row--middle fr-mb-3w"
        style={{ fontWeight: 500 }}
      >
        {nombreDeFinancementsEngagesParLEtat}
        {' '}
        financement(s) engagé(s) par l&apos;État
        {contexte === 'departement' && (
          <Information label="Nombre de demandes de subventions validées des feuilles de route de votre gouvernance" />
        )}
      </div>
      <ul>
        {
          ventilationSubventionsParEnveloppe.map((detail) => (
            <li
              className="fr-mb-w fr-mt-w"
              key={detail.label}
              style={{ listStyle: 'none' }}
            >
              <div style={{ alignItems: 'center', display: 'flex' }}>
                <div
                  className="fr-text--sm"
                  style={{ flex: '1 1 auto', fontWeight: 400, minWidth: 0 }}
                >
                  <Dot color={detail.color} />
                  {' '}
                  {detail.label}
                </div>
                <div 
                  className="fr-text--sm" 
                  style={{ fontWeight: 700, marginLeft: '1rem', marginRight: '1rem', minWidth: '3rem', textAlign: 'right' }}
                >
                  {detail.total}
                </div>
                {contexte === 'admin' && (
                  <div 
                    style={{ width: '6.25rem' }}
                    title={`${detail.pourcentageConsomme}% de l'enveloppe consommée`}
                  >
                    <div
                      className="fr-text--sm" 
                      style={{ backgroundColor: 'var(--grey-900-175)', borderRadius: '4px', height: '8px', width: '100%' }}
                    >
                      <div 
                        style={{ 
                          backgroundColor: 'var(--blue-france-main-525)',
                          borderRadius: '4px',
                          height: '8px',
                          transition: 'width 0.3s ease',
                          width: `${detail.pourcentageConsomme}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))
        }
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
    label: string
    pourcentageConsomme: number
    total: string
  }>
}>