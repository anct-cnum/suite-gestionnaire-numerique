'use client'

import { Fragment, ReactElement, useState } from 'react'

export type ContactData = Readonly<{
  email: string
  estReferentFNE: boolean
  fonction: string
  id: number
  nom: string
  prenom: string
  telephone: string
}>

const MAX_CONTACTS_AFFICHES = 4

export default function StructureContacts(
  { contacts }: Readonly<{ contacts: ReadonlyArray<ContactData> }>
): ReactElement {
  const [isExpanded, setIsExpanded] = useState(false)

  const contactsAffiches = isExpanded ? contacts : contacts.slice(0, MAX_CONTACTS_AFFICHES)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {contactsAffiches.map((contact, index) => (
        <Fragment key={contact.id}>
          {index > 0 ? <div className="separator" /> : null}
          <ContactCard contact={contact} />
        </Fragment>
      ))}
      {contacts.length > MAX_CONTACTS_AFFICHES ? (
        <>
          <div className="separator" />
          <button
            className={`color-blue-france fr-btn--icon-right fr-icon-arrow-${isExpanded ? 'up' : 'down'}-s-line`}
            onClick={() => {
              setIsExpanded(!isExpanded)
            }}
            style={{ alignSelf: 'flex-start' }}
            type="button"
          >
            {isExpanded
              ? 'Voir moins'
              : `Afficher tous les contacts (${contacts.length - MAX_CONTACTS_AFFICHES})`}
          </button>
        </>
      ) : null}
    </div>
  )
}

function ContactCard({ contact }: Readonly<{ contact: ContactData }>): ReactElement {
  return (
    <article
      aria-label={`Contact ${contact.prenom} ${contact.nom}`}
      style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
    >
      <div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
        <p
          className="fr-mb-0"
          style={{ color: 'var(--text-title-blue-france)', fontSize: '1.125rem', fontWeight: 700, lineHeight: '1.75rem' }}
        >
          {contact.nom}
          {' '}
          {contact.prenom}
        </p>
        {contact.estReferentFNE ? (
          <p className="fr-badge fr-badge--blue-cumulus fr-badge--no-icon fr-badge--sm fr-mb-0">
            Référent FNE
          </p>
        ) : null}
      </div>
      {contact.fonction === '' ? null : (
        <p
          className="fr-text--sm fr-mb-0"
          style={{ color: 'var(--text-default-grey)' }}
        >
          {contact.fonction}
        </p>
      )}
      <div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
        {contact.telephone === '' ? null : (
          <>
            <span
              aria-hidden="true"
              className="fr-icon-phone-line fr-icon--sm"
              style={{ color: 'var(--text-mention-grey)' }}
            />
            <span
              className="fr-text--sm fr-mb-0"
              style={{ color: 'var(--text-mention-grey)' }}
            >
              {contact.telephone}
            </span>
          </>
        )}
        {contact.telephone !== '' && contact.email !== '' ? (
          <span style={{ color: 'var(--text-mention-grey)' }}>
            ·
          </span>
        ) : null}
        {contact.email === '' ? null : (
          <>
            <span
              aria-hidden="true"
              className="fr-icon-mail-line fr-icon--sm"
              style={{ color: 'var(--text-mention-grey)' }}
            />
            <span
              className="fr-text--sm fr-mb-0"
              style={{ color: 'var(--text-mention-grey)' }}
            >
              {contact.email}
            </span>
          </>
        )}
      </div>
    </article>
  )
}
