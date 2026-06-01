'use client'

import { ReactElement, useContext, useState } from 'react'

import ConfirmationModal from '../shared/Modal/ConfirmationModal'
import { Notification } from '../shared/Notification/Notification'
import { clientContext } from '@/components/shared/ClientContext'
import { ComparaisonViewModel, StructureComparaisonViewModel } from '@/presenters/comparaisonDoublonsPresenter'

export default function ComparerStructures({ viewModel }: Props): ReactElement {
  const { fusionnerStructuresAction, pathname, router } = useContext(clientContext)

  const [idSurvivante, setIdSurvivante] = useState(viewModel[0]?.id ?? 0)
  const [idAbsorbee, setIdAbsorbee] = useState(viewModel[1]?.id ?? 0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const survivante = viewModel.find((structure) => structure.id === idSurvivante)
  const absorbee = viewModel.find((structure) => structure.id === idAbsorbee)
  const fusionPossible = survivante !== undefined && absorbee !== undefined && idSurvivante !== idAbsorbee

  async function confirmerFusion(): Promise<void> {
    if (!fusionPossible) {
      return
    }
    setIsSubmitting(true)
    const messages = await fusionnerStructuresAction({
      idAbsorbee,
      idSurvivante,
      path: pathname,
    })
    setIsSubmitting(false)
    setIsModalOpen(false)

    if (messages.includes('OK')) {
      Notification('success', { description: 'fusionnées', title: 'Structures ' })
      router.push('/structures-doublons')
    } else {
      Notification('error', { description: messages.join(', '), title: 'Erreur : ' })
    }
  }

  return (
    <section>
      <h1>Examiner un doublon</h1>
      <p className="fr-text--sm fr-text-mention--grey">
        Choisissez la structure à conserver (survivante) et celle à fusionner. Tous les rattachements de la structure
        absorbée seront déplacés vers la survivante, qui conserve ses propres identifiants (SIRET, RNA…).
      </p>

      <div className="fr-grid-row fr-grid-row--gutters">
        {viewModel.map((structure) => (
          <div className="fr-col-12 fr-col-md-6" key={structure.id}>
            <CarteStructure
              estAbsorbee={structure.id === idAbsorbee}
              estSurvivante={structure.id === idSurvivante}
              onAbsorbee={() => {
                setIdAbsorbee(structure.id)
              }}
              onSurvivante={() => {
                setIdSurvivante(structure.id)
              }}
              structure={structure}
            />
          </div>
        ))}
      </div>

      <div className="fr-mt-4w">
        <button
          className="fr-btn"
          disabled={!fusionPossible}
          onClick={() => {
            setIsModalOpen(true)
          }}
          type="button"
        >
          Fusionner
        </button>
        {idSurvivante === idAbsorbee ? (
          <p className="fr-error-text">La survivante et la structure à fusionner doivent être différentes.</p>
        ) : null}
      </div>

      <ConfirmationModal
        confirmLabel={isSubmitting ? 'Fusion en cours…' : 'Confirmer la fusion'}
        confirmVariant="error"
        id="confirmer-fusion"
        isOpen={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
        }}
        onConfirm={() => {
          void confirmerFusion()
        }}
        title="Confirmer la fusion des structures"
      >
        {fusionPossible ? <AvertissementFusion absorbee={absorbee} survivante={survivante} /> : null}
      </ConfirmationModal>
    </section>
  )
}

function CarteStructure({
  estAbsorbee,
  estSurvivante,
  onAbsorbee,
  onSurvivante,
  structure,
}: Readonly<{
  estAbsorbee: boolean
  estSurvivante: boolean
  onAbsorbee(): void
  onSurvivante(): void
  structure: StructureComparaisonViewModel
}>): ReactElement {
  return (
    <div className="fr-p-3w" style={{ border: '1px solid var(--border-default-grey)' }}>
      <h2 className="fr-h5">{structure.denomination}</h2>
      <p className="fr-text--xs fr-text-mention--grey">
        {structure.adresse} · {structure.rattachementsTotal} rattachement{structure.rattachementsTotal > 1 ? 's' : ''}
      </p>

      <dl className="fr-text--sm">
        {structure.champs.map((champ) => (
          <div className="fr-grid-row" key={champ.label}>
            <dt className="fr-col-6 fr-text-mention--grey">{champ.label}</dt>
            <dd className="fr-col-6">{champ.valeur}</dd>
          </div>
        ))}
      </dl>

      <fieldset className="fr-fieldset fr-mt-2w">
        <div className="fr-fieldset__content">
          <div className="fr-radio-group">
            <input
              checked={estSurvivante}
              id={`survivante-${structure.id}`}
              name="survivante"
              onChange={onSurvivante}
              type="radio"
            />
            <label className="fr-label" htmlFor={`survivante-${structure.id}`}>
              Conserver (survivante)
            </label>
          </div>
          <div className="fr-radio-group">
            <input
              checked={estAbsorbee}
              id={`absorbee-${structure.id}`}
              name="absorbee"
              onChange={onAbsorbee}
              type="radio"
            />
            <label className="fr-label" htmlFor={`absorbee-${structure.id}`}>
              Fusionner dans la survivante
            </label>
          </div>
        </div>
      </fieldset>
    </div>
  )
}

function AvertissementFusion({
  absorbee,
  survivante,
}: Readonly<{
  absorbee: StructureComparaisonViewModel
  survivante: StructureComparaisonViewModel
}>): ReactElement {
  const rattachementsDeplaces = absorbee.rattachements.filter((rattachement) => rattachement.nombre > 0)

  return (
    <>
      <div className="fr-alert fr-alert--warning fr-mb-2w">
        <p>
          <span className="fr-text--bold">{absorbee.denomination}</span> sera marquée comme supprimée (réversible via le
          journal d&apos;audit) et ses rattachements déplacés vers{' '}
          <span className="fr-text--bold">{survivante.denomination}</span>.
        </p>
      </div>

      <p className="fr-text--bold">Ce que la fusion implique :</p>
      {rattachementsDeplaces.length === 0 ? (
        <p>Aucun rattachement à déplacer.</p>
      ) : (
        <ul>
          {rattachementsDeplaces.map((rattachement) => (
            <li key={rattachement.label}>
              {rattachement.nombre} {rattachement.label.toLowerCase()}
            </li>
          ))}
        </ul>
      )}

      <p className="fr-text--sm fr-text-mention--grey">
        Les identifiants uniques de la structure absorbée (SIRET, RNA, identifiants Coop/AC…) seront conservés dans le
        journal d&apos;audit puis perdus. Cette action est tracée.
      </p>
    </>
  )
}

type Props = Readonly<{
  viewModel: ComparaisonViewModel
}>
