'use client'

import { ChangeEvent, Fragment, ReactElement } from 'react'

import { ContactExistant } from '../shared/Membre/EntrepriseType'
import TextInput from '../shared/TextInput/TextInput'

export default function SelectionContact({
  contactsExistants,
  idPrefix,
  nouveauContact,
  onChangerEmail,
  onChangerFonction,
  onChangerNom,
  onChangerPrenom,
  titre,
}: SelectionContactProps): ReactElement {
  const aDesContactsExistants = contactsExistants.length > 0

  return (
    <div className="fr-mb-4w">
      <h3 className="fr-h5 fr-mb-3w">{titre}</h3>

      {aDesContactsExistants ? (
        <section
          className="grey-border border-radius fr-mb-3w fr-p-4w"
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <div>
            <p className="fr-text--sm fr-text-mention--grey fr-mb-2w">Contacts existants de cette structure</p>
            <div className="separator" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {contactsExistants.map((contact, index) => (
              <Fragment key={contact.id}>
                {index > 0 ? <div className="separator" /> : null}
                <article
                  aria-label={`Contact ${contact.prenom} ${contact.nom}`}
                  style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
                >
                  <p
                    className="fr-mb-0"
                    style={{
                      color: 'var(--text-title-blue-france)',
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      lineHeight: '1.75rem',
                    }}
                  >
                    {contact.nom} {contact.prenom}
                  </p>
                  <p className="fr-text--sm fr-mb-0" style={{ color: 'var(--text-default-grey)' }}>
                    {contact.fonction}
                  </p>
                  <div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
                    <span
                      aria-hidden="true"
                      className="fr-icon-mail-line fr-icon--sm"
                      style={{ color: 'var(--text-mention-grey)' }}
                    />
                    <span className="fr-text--sm fr-mb-0" style={{ color: 'var(--text-mention-grey)' }}>
                      {contact.email}
                    </span>
                  </div>
                </article>
              </Fragment>
            ))}
          </div>
        </section>
      ) : null}

      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-md-6">
          <TextInput
            id={`${idPrefix}-nom`}
            name={`${idPrefix}-nom`}
            onChange={onChangerNom}
            required={true}
            value={nouveauContact.nom}
          >
            Nom <span className="color-red">*</span>
          </TextInput>
        </div>
        <div className="fr-col-12 fr-col-md-6">
          <TextInput
            id={`${idPrefix}-prenom`}
            name={`${idPrefix}-prenom`}
            onChange={onChangerPrenom}
            required={true}
            value={nouveauContact.prenom}
          >
            Prénom <span className="color-red">*</span>
          </TextInput>
        </div>
      </div>

      <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w">
        <div className="fr-col-12 fr-col-md-6">
          <TextInput
            id={`${idPrefix}-email`}
            name={`${idPrefix}-email`}
            onChange={onChangerEmail}
            required={true}
            type="email"
            value={nouveauContact.email}
          >
            Adresse électronique <span className="color-red">*</span>
          </TextInput>
        </div>
        <div className="fr-col-12 fr-col-md-6">
          <TextInput
            id={`${idPrefix}-fonction`}
            name={`${idPrefix}-fonction`}
            onChange={onChangerFonction}
            required={true}
            value={nouveauContact.fonction}
          >
            Fonction <span className="color-red">*</span>
          </TextInput>
        </div>
      </div>
    </div>
  )
}

type SelectionContactProps = Readonly<{
  contactsExistants: ReadonlyArray<ContactExistant>
  idPrefix: string
  nouveauContact: Readonly<{ email: string; fonction: string; nom: string; prenom: string }>
  onChangerEmail(event: ChangeEvent<HTMLInputElement>): void
  onChangerFonction(event: ChangeEvent<HTMLInputElement>): void
  onChangerNom(event: ChangeEvent<HTMLInputElement>): void
  onChangerPrenom(event: ChangeEvent<HTMLInputElement>): void
  titre: string
}>
