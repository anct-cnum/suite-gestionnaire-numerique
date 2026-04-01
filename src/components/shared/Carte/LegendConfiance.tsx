'use client'

import type { StatistiquesIcp } from '@/presenters/tableauDeBord/indicesPresenter'
import { CONFIANCE_COLORS } from '@/presenters/tableauDeBord/indicesPresenter'
import type { ReactElement } from 'react'

const colGauche: ReadonlyArray<{ couleur: string; label: string; statKey: keyof StatistiquesIcp }> = [
  { couleur: CONFIANCE_COLORS['objectifs sécurisés'], label: 'Objectifs sécurisés', statKey: 'securise' },
  { couleur: CONFIANCE_COLORS['objectifs atteignables'], label: 'Objectifs atteignables', statKey: 'atteignable' },
  { couleur: CONFIANCE_COLORS['appuis nécessaires'], label: 'Appuis nécessaires', statKey: 'appuinecessaire' },
]

const colDroite: ReadonlyArray<{ couleur: string; label: string; statKey: keyof StatistiquesIcp }> = [
  { couleur: CONFIANCE_COLORS['objectifs compromis'], label: 'Objectifs compromis', statKey: 'compromis' },
  { couleur: '#C8C8C8', label: 'Objectifs non enregistrés', statKey: 'nonenregistres' },
]

export default function LegendConfiance({ statistiques }: Props): ReactElement {
  return (
    <div
      style={{
        display: 'grid',
        gap: '0.75rem 3rem',
        gridTemplateColumns: '1fr 1fr',
        padding: '1rem',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {colGauche.map((item) => (
          <LegendItem couleur={item.couleur} key={item.label} label={item.label} total={statistiques[item.statKey]} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {colDroite.map((item) => (
          <LegendItem couleur={item.couleur} key={item.label} label={item.label} total={statistiques[item.statKey]} />
        ))}
      </div>
    </div>
  )
}

function LegendItem({
  couleur,
  label,
  total,
}: Readonly<{
  couleur: string
  label: string
  total: number
}>): ReactElement {
  return (
    <div style={{ alignItems: 'center', display: 'flex' }}>
      <div
        style={{
          backgroundColor: couleur,
          borderRadius: '50%',
          flexShrink: 0,
          height: '16px',
          marginRight: '0.5rem',
          width: '16px',
        }}
      />
      <span>{label}</span>
      <span style={{ fontWeight: 700, marginLeft: 'auto' }}>{total}</span>
    </div>
  )
}

type Props = Readonly<{
  statistiques: StatistiquesIcp
}>
