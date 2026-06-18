'use client'

import { ReactElement, SyntheticEvent, useContext, useId, useState } from 'react'

import Modal from '../shared/Modal/Modal'
import ModalTitle from '../shared/ModalTitle/ModalTitle'
import { clientContext } from '@/components/shared/ClientContext'
import { Notification } from '@/components/shared/Notification/Notification'
import { RattachementsStructureViewModel } from '@/presenters/rattachementsStructurePresenter'

export default function EditionNomStructure({
  denominationAntenne,
  nom,
  rattachements,
  structureId,
}: Props): ReactElement {
  const { modifierNomStructureAction, pathname } = useContext(clientContext)
  const modalId = useId()
  const labelId = useId()
  const inputId = useId()
  const formId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [onglet, setOnglet] = useState<Onglet>('renommer')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const rattachementsNonNuls = rattachements.filter((rattachement) => rattachement.nombre > 0)
  // Structure canonique (nom officiel SIRENE) : on n'autorise pas le renommage (cela créerait un
  // libellé d'antenne). Le renommage ne vise que les structures « antenne ».
  const estCanonique = denominationAntenne === null

  function fermer(): void {
    setIsOpen(false)
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    const nomAffichage = (new FormData(event.currentTarget).get('nomAffichage') as string).trim()

    setIsSubmitting(true)
    const messages = await modifierNomStructureAction({ nomAffichage, path: pathname, structureId })
    setIsSubmitting(false)

    if (messages.includes('OK')) {
      Notification('success', { description: 'modifié', title: 'Nom de la structure ' })
      fermer()
    } else {
      Notification('error', { description: messages.join(', '), title: 'Erreur : ' })
    }
  }

  return (
    <>
      <div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
        <span className="font-weight-500">{nom}</span>
        <button
          aria-controls={modalId}
          className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-edit-line"
          onClick={() => {
            setIsOpen(true)
          }}
          title="Renommer ou fusionner la structure"
          type="button"
        >
          Éditer
        </button>
      </div>

      <Modal close={fermer} id={modalId} isOpen={isOpen} labelId={labelId}>
        <div className="fr-modal__content">
          <ModalTitle id={labelId}>Renommer ou fusionner la structure</ModalTitle>

          <div className="fr-btns-group fr-btns-group--inline fr-btns-group--sm fr-mb-3w">
            <button
              className={onglet === 'renommer' ? 'fr-btn fr-btn--sm' : 'fr-btn fr-btn--sm fr-btn--secondary'}
              onClick={() => {
                setOnglet('renommer')
              }}
              type="button"
            >
              Renommer
            </button>
            <button
              className={onglet === 'fusionner' ? 'fr-btn fr-btn--sm' : 'fr-btn fr-btn--sm fr-btn--secondary'}
              onClick={() => {
                setOnglet('fusionner')
              }}
              type="button"
            >
              Fusionner
            </button>
          </div>

          {onglet === 'renommer' ? (
            <>
              {estCanonique ? (
                <div className="fr-alert fr-alert--info fr-alert--sm fr-mb-2w">
                  <p>
                    Cette structure utilise le nom officiel (SIRENE) — elle est « canonique ». Le renommage n’est pas
                    disponible : il créerait un libellé d’antenne.
                  </p>
                </div>
              ) : (
                <form
                  id={formId}
                  onSubmit={(event) => {
                    void handleSubmit(event)
                  }}
                >
                  <label className="fr-label" htmlFor={inputId}>
                    Nom d’affichage
                    <span className="fr-hint-text">Laisser vide pour afficher le nom officiel (SIRENE).</span>
                  </label>
                  <input
                    className="fr-input"
                    defaultValue={denominationAntenne}
                    id={inputId}
                    maxLength={255}
                    name="nomAffichage"
                    type="text"
                  />
                </form>
              )}

              <div className="fr-mt-3w">
                <p className="fr-text--sm fr-text--bold fr-mb-1v">Éléments rattachés à cette structure</p>
                {estCanonique ? null : (
                  <p className="fr-text--xs fr-text-mention--grey fr-mb-1w">
                    Renommer la structure modifie son affichage partout où elle apparaît.
                  </p>
                )}
                {rattachementsNonNuls.length === 0 ? (
                  <p className="fr-text--sm">Aucun élément rattaché.</p>
                ) : (
                  <ul className="fr-text--sm">
                    {rattachementsNonNuls.map((rattachement) => (
                      <li key={rattachement.label}>
                        {rattachement.label} : <span className="fr-text--bold">{rattachement.nombre}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <div className="fr-py-4w" style={{ textAlign: 'center' }}>
              <p className="fr-badge fr-badge--info fr-badge--no-icon fr-mb-1w">Fonctionnalité à venir</p>
              <p className="fr-text--sm fr-text-mention--grey">
                La fusion de structures sera proposée ici. L’interface reste à définir.
              </p>
            </div>
          )}
        </div>

        {onglet === 'renommer' && !estCanonique ? (
          <div className="fr-modal__footer">
            <div className="fr-btns-group fr-btns-group--right fr-btns-group--inline-lg">
              <button aria-controls={modalId} className="fr-btn fr-btn--secondary" onClick={fermer} type="button">
                Annuler
              </button>
              <button className="fr-btn" disabled={isSubmitting} form={formId} type="submit">
                {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  )
}

type Onglet = 'fusionner' | 'renommer'

type Props = Readonly<{
  denominationAntenne: null | string
  nom: string
  rattachements: RattachementsStructureViewModel
  structureId: number
}>
