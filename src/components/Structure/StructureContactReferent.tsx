'use client'

import { usePathname } from 'next/navigation'
import { Fragment, ReactElement, useId, useRef, useState } from 'react'

import FormulaireContactStructure, { ContactFormData } from './FormulaireContactStructure'
import SupprimerContactReferentStructure from './SupprimerContactReferentStructure'
import Drawer from '../shared/Drawer/Drawer'
import { Notification } from '../shared/Notification/Notification'
import { ajouterContactStructureAction } from '@/app/api/actions/ajouterContactStructureAction'
import { modifierContactStructureAction } from '@/app/api/actions/modifierContactStructureAction'
import { supprimerContactStructureAction } from '@/app/api/actions/supprimerContactStructureAction'
import { StructureViewModel } from '@/presenters/structurePresenter'

export default function StructureContactReferent({ contacts, peutGererStructure, structureId }: Props): ReactElement {
  const pathname = usePathname()
  const [drawerMode, setDrawerMode] = useState<'ajouter' | 'modifier'>('ajouter')
  const [contactAModifier, setContactAModifier] = useState<Contact | null>(null)
  const [contactASupprimer, setContactASupprimer] = useState<Contact | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [drawerKey, setDrawerKey] = useState(0)
  const maxContactsAffiches = 4
  const contactsTries = contacts.toSorted(
    (contactA, contactB) => contactA.nom.localeCompare(contactB.nom, 'fr', { sensitivity: 'base' })
  )
  const contactsAffiches = isExpanded ? contactsTries : contactsTries.slice(0, maxContactsAffiches)
  const drawerRef = useRef<HTMLDialogElement>(null)
  const drawerId = 'drawer-contact-referent'
  const drawerLabelId = useId()
  const modalId = 'modal-supprimer-contact-referent'

  function openDrawerAjouter(): void {
    setDrawerMode('ajouter')
    setContactAModifier(null)
    setDrawerKey((prev) => prev + 1)
    setIsDrawerOpen(true)
  }

  function openDrawerModifier(contact: Contact): void {
    setDrawerMode('modifier')
    setContactAModifier(contact)
    setDrawerKey((prev) => prev + 1)
    setIsDrawerOpen(true)
  }

  function closeDrawer(): void {
    setIsDrawerOpen(false)
    setContactAModifier(null)
    window.dsfr(drawerRef.current).modal.conceal()
  }

  function openModalSupprimer(contact: Contact): void {
    setContactASupprimer(contact)
    setIsModalOpen(true)
  }

  function closeModal(): void {
    setIsModalOpen(false)
    setContactASupprimer(null)
  }

  async function ajouterContact(data: ContactFormData): Promise<void> {
    const messages = await ajouterContactStructureAction({
      email: data.email,
      estReferentFNE: data.estReferentFNE,
      fonction: data.fonction,
      nom: data.nom,
      path: pathname,
      prenom: data.prenom,
      structureId,
      telephone: data.telephone,
    })
    if (messages.includes('OK')) {
      Notification('success', { description: 'ajouté', title: 'Contact ' })
      closeDrawer()
    } else {
      messages.forEach((message) => {
        Notification('error', { description: message, title: 'Erreur ' })
      })
    }
  }

  async function modifierContact(data: ContactFormData): Promise<void> {
    if (contactAModifier === null) {
      return
    }
    const messages = await modifierContactStructureAction({
      contactId: contactAModifier.id,
      email: data.email,
      estReferentFNE: data.estReferentFNE,
      fonction: data.fonction,
      nom: data.nom,
      path: pathname,
      prenom: data.prenom,
      structureId,
      telephone: data.telephone,
    })
    if (messages.includes('OK')) {
      Notification('success', { description: 'modifié', title: 'Contact ' })
      closeDrawer()
    } else {
      messages.forEach((message) => {
        Notification('error', { description: message, title: 'Erreur ' })
      })
    }
  }

  async function supprimerContact(): Promise<void> {
    if (contactASupprimer === null) {
      return
    }
    await supprimerContactStructureAction({
      contactId: contactASupprimer.id,
      path: pathname,
      structureId,
    })
    closeModal()
  }

  return (
    <>
      <section
        aria-labelledby="contact"
        className="grey-border border-radius fr-mb-2w fr-p-4w"
        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
      >
        <header>
          <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
            <h2
              className="fr-h6 fr-mb-0"
              id="contact"
            >
              Contacts
            </h2>
            {peutGererStructure ? (
              <button
                aria-controls={drawerId}
                className="fr-btn fr-btn--secondary fr-btn--sm fr-icon-add-line fr-btn--icon-right"
                data-fr-opened="false"
                onClick={openDrawerAjouter}
                type="button"
              >
                Ajouter un contact
              </button>
            ) : null}
          </div>
          <p className="fr-text--sm fr-text-mention--grey fr-mb-2w">
            Responsable ou contact technique de votre structure
          </p>
          <div className="separator" />
        </header>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {contactsAffiches.map((contact, index) => (
            <Fragment key={contact.id}>
              {index > 0 ? <div className="separator" /> : null}
              <ContactCard
                contact={contact}
                drawerId={drawerId}
                onModifier={peutGererStructure ? openDrawerModifier : undefined}
                onSupprimer={peutGererStructure ? openModalSupprimer : undefined}
              />
            </Fragment>
          ))}
        </div>
        {contacts.length > maxContactsAffiches ? (
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
                : `Afficher tous les contacts (${contacts.length - maxContactsAffiches})`}
            </button>
          </>
        ) : null}
      </section>

      <Drawer
        boutonFermeture="Fermer"
        closeDrawer={closeDrawer}
        id={drawerId}
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={drawerLabelId}
        ref={drawerRef}
      >
        <FormulaireContactStructure
          contactReferent={
            drawerMode === 'modifier' && contactAModifier !== null ? contactAModifier : undefined
          }
          key={drawerKey}
          labelId={drawerLabelId}
          onSubmit={drawerMode === 'modifier' ? modifierContact : ajouterContact}
          titre={drawerMode === 'modifier' ? 'Modifier le contact' : 'Ajouter un contact'}
        />
      </Drawer>

      <SupprimerContactReferentStructure
        closeModal={closeModal}
        contactASupprimer={contactASupprimer}
        id={modalId}
        isOpen={isModalOpen}
        onSupprimer={supprimerContact}
      />
    </>
  )
}

function ContactCard({ contact, drawerId, onModifier, onSupprimer }: ContactCardProps): ReactElement {
  return (
    <article
      aria-label={`Contact ${contact.prenom} ${contact.nom}`}
      style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
    >
      <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
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
        {onModifier !== undefined || onSupprimer !== undefined ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            {onModifier === undefined ? null : (
              <button
                aria-controls={drawerId}
                className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-edit-line fr-btn--icon-right"
                data-fr-opened="false"
                onClick={() => {
                  onModifier(contact)
                }}
                type="button"
              >
                Modifier
              </button>
            )}
            {onSupprimer === undefined ? null : (
              <button
                className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-delete-line fr-btn--icon-right"
                onClick={() => {
                  onSupprimer(contact)
                }}
                type="button"
              >
                Supprimer
              </button>
            )}
          </div>
        ) : null}
      </div>
      <p
        className="fr-text--sm fr-mb-0"
        style={{ color: 'var(--text-default-grey)' }}
      >
        {contact.fonction}
      </p>
      <div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
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
        <span style={{ color: 'var(--text-mention-grey)' }}>
          ·
        </span>
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
      </div>
    </article>
  )
}

type Contact = ContactFormData & Readonly<{ id: number }>

type Props = Readonly<{
  contacts: StructureViewModel['contacts']
  peutGererStructure: boolean
  structureId: number
}>

type ContactCardProps = Readonly<{
  contact: Contact
  drawerId: string
  onModifier: ((contact: Contact) => void) | undefined
  onSupprimer: ((contact: Contact) => void) | undefined
}>
