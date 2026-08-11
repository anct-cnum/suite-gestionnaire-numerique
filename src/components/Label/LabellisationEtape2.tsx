'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

import PageTitle from '../shared/PageTitle/PageTitle'
import Stepper from '../shared/Stepper/Stepper'

export default function LabellisationEtape2(): ReactElement {
  return (
    <div className="fr-container fr-py-4w">
      <PageTitle>Labellisez ma structure conseiller numérique</PageTitle>
      <Stepper
        currentStep={2}
        steps={[{ isCompleted: true, title: 'Vérification' }, { title: 'Attestation sur l’honneur' }]}
      />
      <p>Cette étape sera bientôt disponible.</p>
      <Link className="fr-btn fr-btn--secondary" href="/label">
        Étape précédente
      </Link>
    </div>
  )
}
