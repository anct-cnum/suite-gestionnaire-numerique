'use client'

import { ReactElement, SyntheticEvent, useContext, useId, useState } from 'react'

import Modal from '../shared/Modal/Modal'
import ModalTitle from '../shared/ModalTitle/ModalTitle'
import { clientContext } from '@/components/shared/ClientContext'
import { Notification } from '@/components/shared/Notification/Notification'
import { RattachementsStructureViewModel } from '@/presenters/rattachementsStructurePresenter'

export default function EditionNomStructure({
  adresse,
  denominationAntenne,
  nom,
  rattachements,
  structureId,
}: Props): ReactElement {
  const { modifierAdresseStructureAction, modifierNomStructureAction, pathname } = useContext(clientContext)
  const modalId = useId()
  const labelId = useId()
  const inputNomId = useId()
  const inputAdresseId = useId()
  const formNomId = useId()
  const formAdresseId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [onglet, setOnglet] = useState<Onglet>('renommer')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Une structure canonique (nom officiel SIRENE) ne se modifie pas — ni son nom (cela créerait un
  // libellé d'antenne), ni son adresse. L'édition ne vise que les structures « antenne ».
  const estCanonique = denominationAntenne === null
  const afficherFooter = !estCanonique && (onglet === 'renommer' || onglet === 'adresse')

  function fermer(): void {
    setIsOpen(false)
  }

  function notifier(messages: ReadonlyArray<string>, titre: string, succes: string): void {
    if (messages.includes('OK')) {
      Notification('success', { description: succes, title: titre })
      fermer()
    } else {
      Notification('error', { description: messages.join(', '), title: 'Erreur : ' })
    }
  }

  async function handleSubmitNom(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    const nomAffichage = (new FormData(event.currentTarget).get('nomAffichage') as string).trim()

    setIsSubmitting(true)
    const messages = await modifierNomStructureAction({ nomAffichage, path: pathname, structureId })
    setIsSubmitting(false)

    notifier(messages, 'Nom de la structure ', 'modifié')
  }

  async function handleSubmitAdresse(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    const adresseSaisie = (new FormData(event.currentTarget).get('adresse') as string).trim()

    setIsSubmitting(true)
    const messages = await modifierAdresseStructureAction({ adresse: adresseSaisie, path: pathname, structureId })
    setIsSubmitting(false)

    notifier(messages, 'Adresse de la structure ', 'modifiée')
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
          title="Modifier la structure"
          type="button"
        >
          Éditer
        </button>
      </div>

      <Modal close={fermer} id={modalId} isOpen={isOpen} labelId={labelId}>
        <div className="fr-modal__content">
          <ModalTitle id={labelId}>Modifier la structure</ModalTitle>

          <div className="fr-btns-group fr-btns-group--inline fr-btns-group--sm fr-mb-3w">
            {ONGLETS.map((definition) => (
              <button
                className={onglet === definition.id ? 'fr-btn fr-btn--sm' : 'fr-btn fr-btn--sm fr-btn--secondary'}
                key={definition.id}
                onClick={() => {
                  setOnglet(definition.id)
                }}
                type="button"
              >
                {definition.libelle}
              </button>
            ))}
          </div>

          {onglet === 'renommer' ? (
            <OngletRenommer
              denominationAntenne={denominationAntenne}
              estCanonique={estCanonique}
              formId={formNomId}
              inputId={inputNomId}
              onSubmit={handleSubmitNom}
              rattachements={rattachements}
            />
          ) : null}

          {onglet === 'adresse' ? (
            <OngletAdresse
              adresse={adresse}
              estCanonique={estCanonique}
              formId={formAdresseId}
              inputId={inputAdresseId}
              onSubmit={handleSubmitAdresse}
            />
          ) : null}

          {onglet === 'fusionner' ? <OngletFusionner /> : null}
        </div>

        {afficherFooter ? (
          <div className="fr-modal__footer">
            <div className="fr-btns-group fr-btns-group--right fr-btns-group--inline-lg">
              <button aria-controls={modalId} className="fr-btn fr-btn--secondary" onClick={fermer} type="button">
                Annuler
              </button>
              <button
                className="fr-btn"
                disabled={isSubmitting}
                form={onglet === 'adresse' ? formAdresseId : formNomId}
                type="submit"
              >
                {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  )
}

function OngletRenommer({
  denominationAntenne,
  estCanonique,
  formId,
  inputId,
  onSubmit,
  rattachements,
}: OngletRenommerProps): ReactElement {
  const rattachementsNonNuls = rattachements.filter((rattachement) => rattachement.nombre > 0)

  return (
    <>
      {estCanonique ? (
        <NoticeCanonique>Le renommage n’est pas disponible : il créerait un libellé d’antenne.</NoticeCanonique>
      ) : (
        <form
          id={formId}
          onSubmit={(event) => {
            void onSubmit(event)
          }}
        >
          <label className="fr-label" htmlFor={inputId}>
            Nom d’affichage
            <span className="fr-hint-text">Laisser vide pour afficher le nom officiel (SIRENE).</span>
          </label>
          <input
            className="fr-input"
            defaultValue={denominationAntenne ?? ''}
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
  )
}

function OngletAdresse({ adresse, estCanonique, formId, inputId, onSubmit }: OngletAdresseProps): ReactElement {
  if (estCanonique) {
    return <NoticeCanonique>La modification de l’adresse n’est pas disponible.</NoticeCanonique>
  }

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        void onSubmit(event)
      }}
    >
      <p className="fr-text--sm fr-mb-2w">
        <span className="fr-text--bold">Adresse actuelle : </span>
        {adresse}
      </p>
      <label className="fr-label" htmlFor={inputId}>
        Nouvelle adresse
        <span className="fr-hint-text">
          Géocodée via la Base Adresse Nationale. Une nouvelle adresse est créée si elle n’existe pas déjà.
        </span>
      </label>
      <input
        className="fr-input"
        id={inputId}
        name="adresse"
        placeholder="12 rue de la République, 75001 Paris"
        type="text"
      />
    </form>
  )
}

function OngletFusionner(): ReactElement {
  return (
    <div className="fr-py-4w" style={{ textAlign: 'center' }}>
      <p className="fr-badge fr-badge--info fr-badge--no-icon fr-mb-1w">Fonctionnalité à venir</p>
      <p className="fr-text--sm fr-text-mention--grey">
        La fusion de structures sera proposée ici. L’interface reste à définir.
      </p>
    </div>
  )
}

function NoticeCanonique({ children }: Readonly<{ children: string }>): ReactElement {
  return (
    <div className="fr-alert fr-alert--info fr-alert--sm fr-mb-2w">
      <p>Cette structure utilise le nom officiel (SIRENE) — elle est « canonique ». {children}</p>
    </div>
  )
}

const ONGLETS: ReadonlyArray<Readonly<{ id: Onglet; libelle: string }>> = [
  { id: 'renommer', libelle: 'Renommer' },
  { id: 'adresse', libelle: 'Adresse' },
  { id: 'fusionner', libelle: 'Fusionner' },
]

type OngletRenommerProps = Readonly<{
  denominationAntenne: null | string
  estCanonique: boolean
  formId: string
  inputId: string
  onSubmit(event: SyntheticEvent<HTMLFormElement>): Promise<void>
  rattachements: RattachementsStructureViewModel
}>

type OngletAdresseProps = Readonly<{
  adresse: string
  estCanonique: boolean
  formId: string
  inputId: string
  onSubmit(event: SyntheticEvent<HTMLFormElement>): Promise<void>
}>

type Onglet = 'adresse' | 'fusionner' | 'renommer'

type Props = Readonly<{
  adresse: string
  denominationAntenne: null | string
  nom: string
  rattachements: RattachementsStructureViewModel
  structureId: number
}>
