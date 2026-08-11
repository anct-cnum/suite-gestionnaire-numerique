'use client'

import Link from 'next/link'
import { ReactElement, useState } from 'react'

import BlocMaStructure from './BlocMaStructure'
import PageTitle from '../shared/PageTitle/PageTitle'
import Stepper from '../shared/Stepper/Stepper'
import StructureContactReferent from '../Structure/StructureContactReferent'
import { LabellisationEtape1ViewModel } from '@/presenters/labellisationPresenter'

export default function LabellisationEtape1({ viewModel }: Props): ReactElement {
  const [structureEnEdition, setStructureEnEdition] = useState(false)

  return (
    <div className="fr-container fr-py-4w">
      <PageTitle>Labellisez ma structure conseiller numérique</PageTitle>
      <p className="fr-text--lg fr-mb-4w">Vérifiez vos informations, l’activation prend quelques minutes</p>
      <Stepper currentStep={1} steps={[{ title: 'Vérification' }, { title: 'Attestation sur l’honneur' }]} />
      <BlocMaStructure
        identite={viewModel.identite}
        onModeEditionChange={setStructureEnEdition}
        structureId={viewModel.structureId}
      />
      <StructureContactReferent
        contacts={viewModel.contacts}
        notificationModification={{ description: 'Le contact référent a bien été mis à jour.', title: 'Contact ' }}
        peutGererStructure={true}
        structureId={viewModel.structureId}
        titre="Contact référent de la structure"
      />
      <div className="fr-grid-row fr-mt-4w">
        <div className="fr-col-6">
          <Link className="fr-btn fr-btn--secondary" href="/tableau-de-bord">
            Quitter
          </Link>
        </div>
        <div className="fr-col-6 fr-grid-row--right" style={{ display: 'flex' }}>
          {structureEnEdition ? (
            <button className="fr-btn" disabled={true} type="button">
              Étape suivante
            </button>
          ) : (
            <Link className="fr-btn" href="/label/attestation">
              Étape suivante
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

type Props = Readonly<{
  viewModel: LabellisationEtape1ViewModel
}>
