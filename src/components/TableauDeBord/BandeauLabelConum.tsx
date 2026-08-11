'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

import { suivreEvenement } from '@/shared/matomo'

export default function BandeauLabelConum(): ReactElement {
  return (
    <section className="fr-callout fr-callout--green-emeraude fr-mb-4w">
      <h2 className="fr-callout__title fr-h6">Votre structure est éligible au label conseiller numérique</h2>
      <p className="fr-callout__text fr-text--sm">
        La labellisation conseiller numérique est désormais ouverte. Votre structure y est éligible : demandez le label
        pour valoriser votre activité de médiation numérique et accéder aux ressources réservées aux structures
        labellisées.
      </p>
      <Link className="fr-btn" href="/label" onClick={trackerClicLabelliserStructure}>
        Labelliser ma structure
      </Link>
    </section>
  )
}

// Plan de marquage : suivi du clic sur le CTA, sans donnée personnelle.
function trackerClicLabelliserStructure(): void {
  suivreEvenement('tableau_de_bord', 'clic_labelliser_structure', 'gestionnaire_structure')
}
