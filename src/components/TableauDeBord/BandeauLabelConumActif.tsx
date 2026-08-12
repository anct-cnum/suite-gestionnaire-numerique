'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

import { suivreEvenement } from '@/shared/matomo'

export default function BandeauLabelConumActif({ structureId }: Props): ReactElement {
  return (
    <section className="fr-callout fr-callout--green-emeraude fr-mb-4w">
      <h2 className="fr-callout__title fr-h6">✅ Votre structure est labellisée conseiller numérique</h2>
      <p className="fr-callout__text fr-text--sm">
        Le label est actif. Profitez des formations, de la communauté et des outils proposés. Vous recevrez un mail pour
        confirmer votre activité et renouveler le label.
      </p>
      <Link className="fr-btn" href={`/structure/${structureId}#labellisation`} onClick={trackerClicVoirStatutLabel}>
        Voir le statut de mon label
      </Link>
    </section>
  )
}

type Props = Readonly<{
  structureId: number
}>

// Plan de marquage : suivi du clic sur le CTA, sans donnée personnelle.
function trackerClicVoirStatutLabel(): void {
  suivreEvenement('tableau_de_bord', 'clic_voir_statut_label', 'gestionnaire_structure')
}
