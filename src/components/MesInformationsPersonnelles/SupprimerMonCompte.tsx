import { signOut } from 'next-auth/react'
import { Dispatch, FormEvent, ReactElement, SetStateAction, useId, useState } from 'react'

import styles from './SupprimerMonCompte.module.css'
import { supprimerMonCompteAction } from '../../app/api/actions/supprimerMonCompteAction'

export default function SupprimerMonCompte({ id, email, isOpen, setIsOpen }: SupprimerMonCompteProps): ReactElement {
  const [emailValidationInfo, setEmailValidationInfo] =
    useState<EmailValidationInfo>(emailValidationInfoByState.invalid)
  const [etatBoutonSuppression, setEtatBoutonSuppression] = useState<EtatBoutonSuppression>({
    enAttente: false,
    texte: 'Confirmer la suppression',
  })
  const modaleTitreId = useId()
  const champEmailId = useId()
  const messageValidationId = 'supprimer-mon-compte-email-message-validation'

  return (
    <dialog
      aria-labelledby={modaleTitreId}
      aria-modal="true"
      className="fr-modal"
      id={id}
      open={isOpen}
    >
      <div className="fr-container fr-container--fluid fr-container-md">
        <div className="fr-grid-row fr-grid-row--center">
          <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
            <div className="fr-modal__body modal-body">
              <div className="fr-modal__header">
                <button
                  aria-controls={id}
                  className="fr-btn--close fr-btn"
                  onClick={close}
                  type="button"
                >
                  Fermer
                </button>
              </div>
              <form aria-label="Supprimer">
                <div className="fr-modal__content">
                  <h1
                    className="fr-modal__title"
                    id={modaleTitreId}
                  >
                    Supprimer mon compte
                  </h1>
                  <p>
                    Êtes-vous sûr de vouloir supprimer votre compte ? Cette
                    action est irréversible.
                  </p>
                  <div className={`fr-input-group ${styles['fr-input-group']} ${emailValidationInfo.groupClass}`}>
                    <label
                      className={`fr-label ${styles['fr-label']}`}
                      htmlFor={champEmailId}
                    >
                      Saisissez «
                      {' '}
                      {email}
                      {' '}
                      » dans le champ ci-dessous
                    </label>
                    <input
                      aria-describedby={messageValidationId}
                      className={`fr-input ${emailValidationInfo.inputClass}`}
                      id={champEmailId}
                      onInput={handleInput}
                      pattern=".+@.+\..{2,}"
                      required={true}
                      type="email"
                    />
                    <p
                      className={emailValidationInfo.messageClass}
                      id={messageValidationId}
                    >
                      {emailValidationInfo.message}
                    </p>
                  </div>
                </div>
                <div className="fr-modal__footer">
                  <div className="fr-btns-group fr-btns-group--right fr-btns-group--inline-lg fr-btns-group--icon-left">
                    <button
                      aria-controls={id}
                      className="fr-btn fr-btn--secondary"
                      onClick={close}
                      type="button"
                    >
                      Annuler
                    </button>
                    <button
                      className="fr-btn red-button"
                      disabled={isConfirmerDisabled()}
                      formMethod="dialog"
                      onClick={logout}
                      type="submit"
                    >
                      {etatBoutonSuppression.texte}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  )

  function close(): void {
    setIsOpen(false)
  }

  function handleInput({ currentTarget }: FormEvent<HTMLInputElement>): void {
    currentTarget.value = currentTarget.value.trim()
    setEmailValidationInfo(emailValidationInfoByState[validationState(currentTarget, email)])
  }

  async function logout(event: FormEvent<HTMLButtonElement>): Promise<void> {
    event.preventDefault()

    setEtatBoutonSuppression({ enAttente: true, texte: 'Suppression en cours' })

    await supprimerMonCompteAction()
      .then(async () => signOut({ callbackUrl: '/connexion' }))
  }

  function isConfirmerDisabled(): boolean {
    return !emailValidationInfo.isOk || etatBoutonSuppression.enAttente
  }
}

type SupprimerMonCompteProps = Readonly<{
  id: string
  email: string
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
}>

type EmailValidationState = 'correct' | 'incorrect' | 'invalid'

type EmailValidationInfo = Readonly<{
  groupClass: string
  inputClass: string
  messageClass: string
  message: string
  isOk: boolean
}>

type EtatBoutonSuppression = Readonly<{
  enAttente: boolean
  texte: string
}>

const emailValidationInfoByState: Readonly<Record<EmailValidationState, EmailValidationInfo>> = {
  correct: {
    groupClass: 'fr-input-group--valid',
    inputClass: 'fr-input--valid',
    isOk: true,
    message: 'L’adresse électronique saisie est valide',
    messageClass: 'fr-valid-text',
  },
  incorrect: {
    groupClass: 'fr-input-group--error',
    inputClass: 'fr-input--error',
    isOk: false,
    message: 'L’adresse électronique saisie n’est pas reliée au compte utilisateur',
    messageClass: 'fr-error-text',
  },
  invalid: {
    groupClass: 'fr-input-group--error',
    inputClass: 'fr-input--error',
    isOk: false,
    message: '',
    messageClass: '',
  },
}

function validationState(input: HTMLInputElement, email: string): EmailValidationState {
  if (!input.checkValidity()) {
    return 'invalid'
  }

  if (email !== input.value) {
    return 'incorrect'
  }

  return 'correct'
}
