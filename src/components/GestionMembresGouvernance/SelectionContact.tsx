'use client'

import { ChangeEvent, ReactElement } from 'react'

import { ContactExistant } from '../shared/Membre/EntrepriseType'
import TextInput from '../shared/TextInput/TextInput'

export default function SelectionContact({
  contactExistantId,
  contactsExistants,
  idPrefix,
  mode,
  nouveauContact,
  onChangerEmail,
  onChangerFonction,
  onChangerNom,
  onChangerPrenom,
  onChoisirExistant,
  onChoisirNouveau,
  titre,
}: SelectionContactProps): ReactElement {
  const aDesContactsExistants = contactsExistants.length > 0

  return (
    <div className="fr-mb-4w">
      <h3 className="fr-h5 fr-mb-3w">{titre}</h3>

      {aDesContactsExistants ? (
        <div className="fr-form-group">
          <fieldset className="fr-fieldset">
            <legend className="fr-fieldset__legend fr-text--regular">
              Cette structure existe déjà. Souhaitez-vous réutiliser un contact existant ?
            </legend>
            <div className="fr-fieldset__content">
              {contactsExistants.map((contact) => (
                <div className="fr-radio-group" key={contact.id}>
                  <input
                    checked={mode === 'existant' && contactExistantId === contact.id}
                    id={`${idPrefix}-existant-${contact.id}`}
                    name={`choix-${idPrefix}`}
                    onChange={() => {
                      onChoisirExistant(contact.id)
                    }}
                    type="radio"
                  />
                  <label className="fr-label" htmlFor={`${idPrefix}-existant-${contact.id}`}>
                    {contact.prenom} {contact.nom}
                    <span className="fr-hint-text">
                      {contact.fonction} — {contact.email}
                    </span>
                  </label>
                </div>
              ))}
              <div className="fr-radio-group">
                <input
                  checked={mode === 'nouveau'}
                  id={`${idPrefix}-nouveau`}
                  name={`choix-${idPrefix}`}
                  onChange={onChoisirNouveau}
                  type="radio"
                />
                <label className="fr-label" htmlFor={`${idPrefix}-nouveau`}>
                  Créer un nouveau contact
                </label>
              </div>
            </div>
          </fieldset>
        </div>
      ) : null}

      {mode === 'nouveau' ? (
        <>
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
        </>
      ) : null}
    </div>
  )
}

type SelectionContactProps = Readonly<{
  contactExistantId: null | number
  contactsExistants: ReadonlyArray<ContactExistant>
  idPrefix: string
  mode: 'existant' | 'nouveau'
  nouveauContact: Readonly<{ email: string; fonction: string; nom: string; prenom: string }>
  onChangerEmail(event: ChangeEvent<HTMLInputElement>): void
  onChangerFonction(event: ChangeEvent<HTMLInputElement>): void
  onChangerNom(event: ChangeEvent<HTMLInputElement>): void
  onChangerPrenom(event: ChangeEvent<HTMLInputElement>): void
  onChoisirExistant(id: number): void
  onChoisirNouveau(): void
  titre: string
}>
