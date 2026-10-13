'use client'

import { Fragment, ReactElement, SyntheticEvent, useId, useState } from 'react'

import { ContactEdite, ContactPrincipal } from './types'
import TextInput from '../shared/TextInput/TextInput'
import { emailPattern } from '@/shared/patterns'

export default function GestionContactsMembre({
  contacts,
  onAjouter,
  onModifier,
  onSupprimer,
}: GestionContactsMembreProps): ReactElement {
  const [contactEnEdition, setContactEnEdition] = useState<'nouveau' | ContactEdite | null>(null)
  const nomId = useId()
  const prenomId = useId()
  const emailId = useId()
  const fonctionId = useId()

  return (
    <div className="fr-mb-4w">
      <h3 className="fr-h5 fr-mb-3w">Contacts de la structure</h3>

      {contacts.length > 0 ? (
        <section
          aria-label="Contacts de la structure"
          className="grey-border border-radius fr-mb-3w fr-p-4w"
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          {contacts.map((contact, index) => (
            <Fragment key={contact.cle}>
              {index > 0 ? <div className="separator" /> : null}
              <article
                aria-label={`Contact ${contact.donnees.prenom} ${contact.donnees.nom}`}
                style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
              >
                <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
                  <p
                    className="fr-mb-0"
                    style={{
                      color: 'var(--text-title-blue-france)',
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      lineHeight: '1.75rem',
                    }}
                  >
                    {contact.donnees.nom} {contact.donnees.prenom}
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-edit-line fr-btn--icon-right"
                      onClick={() => {
                        setContactEnEdition(contact)
                      }}
                      title={`Modifier le contact ${contact.donnees.prenom} ${contact.donnees.nom}`}
                      type="button"
                    >
                      Modifier
                    </button>
                    <button
                      className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-delete-line fr-btn--icon-right"
                      onClick={() => {
                        supprimer(contact)
                      }}
                      title={`Supprimer le contact ${contact.donnees.prenom} ${contact.donnees.nom}`}
                      type="button"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                <p className="fr-text--sm fr-mb-0" style={{ color: 'var(--text-default-grey)' }}>
                  {contact.donnees.fonction}
                </p>
                <div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
                  <span
                    aria-hidden="true"
                    className="fr-icon-mail-line fr-icon--sm"
                    style={{ color: 'var(--text-mention-grey)' }}
                  />
                  <span className="fr-text--sm fr-mb-0" style={{ color: 'var(--text-mention-grey)' }}>
                    {contact.donnees.email}
                  </span>
                </div>
              </article>
            </Fragment>
          ))}
        </section>
      ) : (
        <p className="fr-text--sm fr-text-mention--grey fr-mb-3w">
          Aucun contact connu pour cette structure. Ajoutez au moins un contact.
        </p>
      )}

      {contactEnEdition === null ? (
        <button
          className="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-add-line"
          onClick={() => {
            setContactEnEdition('nouveau')
          }}
          type="button"
        >
          Ajouter un contact
        </button>
      ) : (
        <form
          aria-label={contactEnEdition === 'nouveau' ? 'Ajouter un contact' : 'Modifier le contact'}
          className="grey-border border-radius fr-p-4w"
          key={contactEnEdition === 'nouveau' ? 'nouveau' : contactEnEdition.cle}
          onSubmit={enregistrer}
        >
          <h4 className="fr-h6 fr-mb-3w">
            {contactEnEdition === 'nouveau' ? 'Ajouter un contact' : 'Modifier le contact'}
          </h4>
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-col-md-6">
              <TextInput defaultValue={valeurInitiale('nom')} id={nomId} name="nom" required={true}>
                Nom <span className="color-red">*</span>
              </TextInput>
            </div>
            <div className="fr-col-12 fr-col-md-6">
              <TextInput defaultValue={valeurInitiale('prenom')} id={prenomId} name="prenom" required={true}>
                Prénom <span className="color-red">*</span>
              </TextInput>
            </div>
            <div className="fr-col-12 fr-col-md-6">
              <TextInput
                defaultValue={valeurInitiale('email')}
                id={emailId}
                name="email"
                pattern={emailPattern.source}
                required={true}
                type="email"
              >
                Adresse électronique <span className="color-red">*</span>
              </TextInput>
            </div>
            <div className="fr-col-12 fr-col-md-6">
              <TextInput defaultValue={valeurInitiale('fonction')} id={fonctionId} name="fonction" required={true}>
                Fonction <span className="color-red">*</span>
              </TextInput>
            </div>
          </div>
          <ul className="fr-btns-group fr-btns-group--inline-md fr-btns-group--right fr-mt-2w">
            <li>
              <button
                className="fr-btn fr-btn--secondary"
                onClick={() => {
                  setContactEnEdition(null)
                }}
                type="button"
              >
                Annuler
              </button>
            </li>
            <li>
              <button className="fr-btn" type="submit">
                Enregistrer le contact
              </button>
            </li>
          </ul>
        </form>
      )}
    </div>
  )

  function valeurInitiale(champ: keyof ContactPrincipal): string {
    return contactEnEdition === null || contactEnEdition === 'nouveau' ? '' : contactEnEdition.donnees[champ]
  }

  function enregistrer(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const donnees: ContactPrincipal = {
      email: (form.get('email') as string).trim(),
      fonction: (form.get('fonction') as string).trim(),
      nom: (form.get('nom') as string).trim(),
      prenom: (form.get('prenom') as string).trim(),
    }

    if (contactEnEdition === 'nouveau') {
      onAjouter(donnees)
    } else if (contactEnEdition !== null) {
      onModifier(contactEnEdition.cle, donnees)
    }
    setContactEnEdition(null)
  }

  function supprimer(contact: ContactEdite): void {
    if (contactEnEdition !== null && contactEnEdition !== 'nouveau' && contactEnEdition.cle === contact.cle) {
      setContactEnEdition(null)
    }
    onSupprimer(contact.cle)
  }
}

type GestionContactsMembreProps = Readonly<{
  contacts: ReadonlyArray<ContactEdite>
  onAjouter(donnees: ContactPrincipal): void
  onModifier(cle: string, donnees: ContactPrincipal): void
  onSupprimer(cle: string): void
}>
