'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactElement, useId, useState } from 'react'

import Checkbox from '../shared/Checkbox/Checkbox'
import { Notification } from '../shared/Notification/Notification'
import PageTitle from '../shared/PageTitle/PageTitle'
import Stepper from '../shared/Stepper/Stepper'
import { attesterLabellisationAction } from '@/app/api/actions/attesterLabellisationAction'
import { LabellisationEtape2ViewModel } from '@/presenters/labellisationPresenter'

export default function LabellisationEtape2({ viewModel }: Props): ReactElement {
  const router = useRouter()
  const attestationActiviteId = useId()
  const attestationSignalementId = useId()
  const [attesteActivite, setAttesteActivite] = useState(false)
  const [attesteSignalement, setAttesteSignalement] = useState(false)
  const [activationEnCours, setActivationEnCours] = useState(false)

  async function confirmerEtActiver(): Promise<void> {
    setActivationEnCours(true)
    const messages = await attesterLabellisationAction({
      path: '/tableau-de-bord',
      structureId: viewModel.structureId,
    })
    if (messages.includes('OK')) {
      Notification('success', {
        description: 'Votre structure est désormais labellisée conseiller numérique.',
        title: 'Label activé ',
      })
      router.push('/tableau-de-bord')
    } else {
      setActivationEnCours(false)
      messages.forEach((message) => {
        Notification('error', { description: message, title: 'Erreur ' })
      })
    }
  }

  return (
    <div className="fr-container fr-py-4w">
      <PageTitle>Labellisez votre structure conseiller numérique</PageTitle>
      <p className="fr-text--lg fr-mb-4w">Vérifiez vos informations, l’activation prend quelques minutes</p>
      <Stepper
        currentStep={2}
        steps={[{ isCompleted: true, title: 'Vérification' }, { title: 'Attestation sur l’honneur' }]}
      />
      <section
        aria-labelledby="attestation-sur-honneur"
        className="grey-border border-radius fr-mb-2w fr-p-4w zone-impression"
      >
        <header>
          <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
            <h2 className="fr-h6 fr-mb-0" id="attestation-sur-honneur">
              Attestation sur l’honneur
            </h2>
            <button
              className="fr-btn fr-btn--secondary fr-btn--sm masquer-impression"
              onClick={() => {
                globalThis.print()
              }}
              type="button"
            >
              Imprimer
            </button>
          </div>
          <div className="separator fr-my-3w" />
        </header>
        <h3 className="fr-text--md fr-mb-1v">Ce que le label reconnaît</h3>
        <p>
          Le label conseiller numérique atteste que votre structure emploie au moins un professionnel qualifié qui
          exerce la médiation numérique auprès des publics. Il vous donne accès à la formation continue financée, à la
          communauté professionnelle, à la marque conseiller numérique et aux outils mis à disposition.
        </p>
        <h3 className="fr-text--md fr-mb-1v">Ce que votre structure atteste</h3>
        <p className="fr-mb-0">
          Que le ou les professionnels désignés exercent effectivement la médiation numérique de manière significative
          dans leur activité.
        </p>
        <p>Que les informations fournies sont exactes.</p>
        <h3 className="fr-text--md fr-mb-1v">Ce à quoi votre structure s’engage</h3>
        <p className="fr-mb-0">
          Signaler tout changement de situation : départ d’un médiateur, arrêt de l’activité de médiation numérique,
          changement de responsable.
        </p>
        <p>Répondre à la demande de renouvellement (un simple clic de confirmation).</p>
        <a className="fr-link" href="#fonctionnement-du-label">
          Détail sur le fonctionnement du label
        </a>
        <div className="separator fr-my-3w" />
        <p className="fr-text--sm fr-text-mention--grey fr-mb-1v">Structure porteuse du label</p>
        <p className="fr-text--bold fr-mb-0">{viewModel.structure.nom}</p>
        <p className="fr-mb-0">{viewModel.structure.adresse}</p>
        <p>N°SIRET : {viewModel.structure.siret}</p>
        <div className="separator fr-my-3w" />
        <p>
          En tant que représentant de <span className="fr-text--bold">{viewModel.structure.nom}</span>, je confirme les
          points suivants :
        </p>
        <fieldset className="fr-fieldset">
          <Checkbox
            id={attestationActiviteId}
            label="attestation-activite"
            onChange={(event) => {
              setAttesteActivite(event.target.checked)
            }}
            value="attestation-activite"
          >
            Les professionnels désignés à l’étape précédente exercent une activité significative de médiation numérique
            au sein de ma structure.
          </Checkbox>
          <Checkbox
            id={attestationSignalementId}
            label="attestation-signalement"
            onChange={(event) => {
              setAttesteSignalement(event.target.checked)
            }}
            value="attestation-signalement"
          >
            Je m’engage à signaler tout changement de situation (départ d’un médiateur, arrêt de l’activité de médiation
            numérique).
          </Checkbox>
        </fieldset>
      </section>
      <div className="fr-grid-row fr-mt-4w">
        <div className="fr-col-6">
          <Link className="fr-btn fr-btn--secondary" href="/label">
            Précédent
          </Link>
        </div>
        <div className="fr-col-6 fr-grid-row--right" style={{ display: 'flex' }}>
          <button
            className="fr-btn"
            disabled={!attesteActivite || !attesteSignalement || activationEnCours}
            onClick={() => {
              void confirmerEtActiver()
            }}
            type="button"
          >
            {activationEnCours ? 'Activation en cours...' : 'Confirmer et activer le label'}
          </button>
        </div>
      </div>
    </div>
  )
}

type Props = Readonly<{
  viewModel: LabellisationEtape2ViewModel
}>
