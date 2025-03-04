import { signOut } from 'next-auth/react'
import { FormEvent, ReactElement, useContext, useId, useState } from 'react'

import { clientContext } from '../shared/ClientContext'
import Modal from '../shared/Modal/Modal'
import ModalTitle from '../shared/ModalTitle/ModalTitle'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import { emailPattern } from '@/shared/patterns'

export default function SupprimerMonCompte({ id, email, isOpen, closeModal }: Props): ReactElement {
  const { supprimerMonCompteAction } = useContext(clientContext)
  const [emailValidationInfo, setEmailValidationInfo] =
    useState<EmailValidationInfo>(emailValidationInfoByState.invalid)
  const [isDisabled, setIsDisabled] = useState(false)
  const labelModaleId = useId()
  const champEmailId = useId()
  const messageValidationId = 'supprimer-mon-compte-email-message-validation'

  return (
    <Modal
      close={close}
      id={id}
      isOpen={isOpen}
      labelId={labelModaleId}
    >
      <form
        aria-label="Supprimer"
        method="dialog"
        onSubmit={logout}
      >
        <div className="fr-modal__content">
          <ModalTitle id={labelModaleId}>
            Supprimer mon compte
          </ModalTitle>
          <p>
            Êtes-vous sûr de vouloir supprimer votre compte ? Cette
            action est irréversible.
          </p>
          <div className={`fr-input-group input-group--sobre ${emailValidationInfo.groupClass}`}>
            <label
              className="fr-label"
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
              pattern={emailPattern.source}
              required={true}
              type="email"
            />
            {
              // Stryker disable next-line ConditionalExpression
              emailValidationInfo.message === '' ? null : (
                <p
                  className={emailValidationInfo.messageClass}
                  id={messageValidationId}
                >
                  {emailValidationInfo.message}
                </p>
              )
            }
          </div>
        </div>
        <div className="fr-modal__footer">
          <div className="fr-btns-group fr-btns-group--right fr-btns-group--inline-lg fr-btns-group--icon-left">
            <button
              aria-controls={id}
              className="fr-btn fr-btn--secondary"
              onClick={close}
              type="reset"
            >
              Annuler
            </button>
            <SubmitButton isDisabled={isConfirmerDisabled()}>
              {isDisabled ? 'Suppression en cours...' : 'Confirmer la suppression'}
            </SubmitButton>
          </div>
        </div>
      </form>
    </Modal>
  )

  function close(): void {
    setEmailValidationInfo(emailValidationInfoByState.invalid)
    closeModal()
  }

  function handleInput({ currentTarget }: FormEvent<HTMLInputElement>): void {
    currentTarget.value = currentTarget.value.trim()
    setEmailValidationInfo(emailValidationInfoByState[validationState(currentTarget, email)])
  }

  async function logout(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    setIsDisabled(true)

    await supprimerMonCompteAction()
      .then(async () => signOut({ callbackUrl: '/connexion' }))
  }

  function isConfirmerDisabled(): boolean {
    return !emailValidationInfo.isOk || isDisabled
  }
}

type Props = Readonly<{
  id: string
  email: string
  isOpen: boolean
  closeModal(): void
}>

type EmailValidationState = 'correct' | 'incorrect' | 'invalid'

type EmailValidationInfo = Readonly<{
  groupClass: string
  inputClass: string
  messageClass: string
  message: string
  isOk: boolean
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
