'use client'

import { ReactElement } from 'react'

import Dot from '../shared/Dot/Dot'
import { EnveloppeConseillerNumeriqueViewModel } from '@/presenters/tableauDeBord/enveloppesConseillerNumeriquePresenter'

export default function EnveloppesConseillerNumerique({ enveloppes }: Props): ReactElement {
  return (
    <ul>
      {enveloppes.map((enveloppe) => (
        <li key={enveloppe.label} style={{ listStyle: 'none' }}>
          <div style={{ alignItems: 'center', display: 'flex' }}>
            <div className="fr-text--sm fr-mb-1w" style={{ flex: '1 1 auto', fontWeight: 400, minWidth: 0 }}>
              <Dot color={enveloppe.color} /> {enveloppe.label}
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
              {enveloppe.total}
            </div>
            <div style={{ width: '6.25rem' }} title={`${enveloppe.pourcentageConsomme}% de l'enveloppe consommée`}>
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
                    backgroundColor: 'var(--blue-france-main-525)',
                    borderRadius: '4px',
                    height: '8px',
                    transition: 'width 0.3s ease',
                    width: `${Math.min(enveloppe.pourcentageConsomme, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

type Props = Readonly<{
  enveloppes: ReadonlyArray<EnveloppeConseillerNumeriqueViewModel>
}>
