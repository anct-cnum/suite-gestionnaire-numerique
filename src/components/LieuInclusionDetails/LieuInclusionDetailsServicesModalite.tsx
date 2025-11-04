'use client'

import { usePathname } from 'next/navigation'
import { FormEvent, ReactElement, useContext, useState } from 'react'

import { clientContext } from '@/components/shared/ClientContext'
import { Notification } from '@/components/shared/Notification/Notification'

export default function LieuInclusionDetailsServicesModalite(props: Props): ReactElement {
  const { email, fraisACharge, modalitesAcces, peutModifier, telephone } = props
  const [isEditing, setIsEditing] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)

  const { modifierLieuInclusionServicesModaliteAction } = useContext(clientContext)
  const pathname = usePathname()

  // Extraire l'ID de structure depuis l'URL (/lieu/[id])
  const structureId = pathname.split('/').pop() ?? ''

  // Options pour les modalités d'accès
  const modalitesAccesOptions = [
    { label: 'Se présenter sur place', value: 'Se présenter sur place' },
    { label: 'Téléphoner', value: 'Téléphoner' },
    { label: 'Contacter par mail', value: 'Contacter par mail' },
  ]

  // Options pour les frais à charge
  const fraisAChargeOptions = [
    {
      label: 'Gratuit',
      subLabel: 'Accès gratuit au lieu et à ses services',
      value: 'Gratuit',
    },
    {
      label: 'Gratuit sous condition',
      subLabel: 'La gratuité est conditionnée à des critères (adhésion, situation familiale, convention avec un organisme social, pass numérique...)',
      value: 'Gratuit sous condition',
    },
    {
      label: 'Payant',
      subLabel: 'L\'accès au lieu et/ou à ses services est payant',
      value: 'Payant',
    },
  ]

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const modalitesAccesValues = form.getAll('modalites-acces') as ReadonlyArray<string>
    const fraisAChargeValues = form.getAll('frais-a-charge') as ReadonlyArray<string>
    const telephoneValue = form.get('telephone') as string
    const emailValue = form.get('email') as string

    setIsDisabled(true)

    const messages = await modifierLieuInclusionServicesModaliteAction({
      email: emailValue,
      fraisACharge: [...fraisAChargeValues],
      modalitesAcces: [...modalitesAccesValues],
      path: pathname,
      structureId,
      telephone: telephoneValue,
    })

    if (messages.includes('OK')) {
      Notification('success', { description: 'modifiées', title: 'Modalités d\'accès au service ' })
      setIsEditing(false)
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }

    setIsDisabled(false)
  }

  function handleCancel(): void {
    setIsEditing(false)
  }

  function handleEditClick(): void {
    setIsEditing(true)
  }

  function getRenderMail(): ReactElement {
    if(isEditing){
      return (
        <div className="fr-input-group">
          <label
            className="fr-label"
            htmlFor="email"
          >
            Précisez l&apos;adresse mail de contact
            {' '}
            <span className="fr-hint-text">
              Format attendu : nom@domaine.fr
            </span>
          </label>
          <input
            className="fr-input"
            defaultValue={email ?? ''}
            id="email"
            name="email"
            placeholder="nom@domaine.fr"
            type="email"
          />
        </div>
      )
    }
    if (typeof email === 'string' && email.length > 0) {
      return (
        <a
          className="fr-link"
          href={`mailto:${email}`}
        >
          {email}
        </a>
      )
    }
    return (
      <p className="fr-text--sm">
        Non renseigné
      </p>
    )
  }

  function getRenderTel(): ReactElement {
    if(isEditing) {
      return (
        <div className="fr-input-group">
          <label
            className="fr-label"
            htmlFor="telephone"
          >
            Précisez le téléphone de contact
            {' '}
            <span className="fr-hint-text">
              Exemple: 06 00 00 00 00 ou 0600000000
            </span>
          </label>
          <input
            className="fr-input"
            defaultValue={telephone ?? ''}
            id="telephone"
            name="telephone"
            placeholder="06 00 00 00 00"
            type="text"
          />
        </div>
      )}
    if(typeof telephone === 'string' && telephone.length > 0 ) {
      return (
        <a
          className="fr-link fr-text--md"
          href={`tel:${telephone}`}
        >
          {telephone}
        </a>
      )}
    return (
      <p className="fr-text--sm">
        Non renseigné
      </p>
    )
  }

  return (
    <form
      className="fr-px-4w fr-pb-2w"
      onSubmit={handleSubmit}
    >
      <div className="fr-grid-row fr-grid-row--gutters fr-pb-2w">
        <div className="fr-col fr-col-12 fr-col-md-8">
          <h4 className="fr-h6 fr-mb-1v">
            Modalités d&apos;accès au service
          </h4>
          <p
            className="fr-text--sm fr-mb-2w"
            style={{ color: 'var(--grey-425-625)' }}
          >
            Indiquez comment bénéficier des services d&apos;inclusion numérique.
          </p>
        </div>
        <div className="fr-col fr-col-12 fr-col-md-4">
          <div className="fr-grid-row fr-grid-row--right">
            {!isEditing && peutModifier ? (
              <button
                className="fr-link fr-icon-edit-fill fr-link--icon-right fr-mt-n2w"
                onClick={handleEditClick}
                type="button"
              >
                Modifier
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {isEditing
        ? (
          <p
            className="fr-text--sm fr-mb-3w"
            style={{ color: 'var(--grey-425-625)' }}
          >
            Ces champs sont optionnels
          </p>
        )
        : null}

      <div className="fr-mb-3w">
        <h5 className="fr-text--md fr-mb-1w">
          Modalités d&apos;accès
        </h5>
        <p className="fr-text--sm fr-mb-2w">
          Indiquez comment bénéficier de vos services. Sélectionnez un ou plusieurs choix.
        </p>
        {isEditing ? (
          <fieldset className="fr-fieldset">
            <div className="fr-fieldset__content">
              {modalitesAccesOptions.map((option) => (
                <div
                  className="fr-checkbox-group"
                  key={option.value}
                >
                  <input
                    defaultChecked={modalitesAcces?.includes(option.value)}
                    id={option.value}
                    name="modalites-acces"
                    type="checkbox"
                    value={option.value}
                  />
                  <label
                    className="fr-label"
                    htmlFor={option.value}
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        ) : (
          <div className="fr-tags-group">
            {modalitesAcces && modalitesAcces.length > 0 ?
              modalitesAcces.map((modalite) => (
                <span
                  className="fr-tag fr-tag--mg"
                  key={modalite}
                >
                  {modalite}
                </span>
              )) : (
                <span className="fr-tag fr-tag--mg">
                  Non renseigné
                </span>
              )}
          </div>
        )}
      </div>

      <div className="fr-mb-3w">
        <h5 className="fr-text--md fr-mb-1w">
          Téléphone de contact
        </h5>
        {getRenderTel()}
      </div>

      <div className="fr-mb-3w">
        <h5 className="fr-text--md fr-mb-1w">
          Adresse mail de contact
        </h5>
        {getRenderMail()}
      </div>

      <div className="fr-mb-3w">
        <h5 className="fr-text--md fr-mb-1w">
          Frais à charge
        </h5>
        <p className="fr-text--sm fr-mb-2w">
          Indiquez les conditions financières d&apos;accès aux services.
        </p>
        {isEditing ? (
          <fieldset className="fr-fieldset">
            <div className="fr-fieldset__content">
              {fraisAChargeOptions.map((option) => (
                <div
                  className="fr-checkbox-group"
                  key={option.value}
                >
                  <input
                    defaultChecked={fraisACharge?.includes(option.value)}
                    id={option.value}
                    name="frais-a-charge"
                    type="checkbox"
                    value={option.value}
                  />
                  <label
                    className="fr-label"
                    htmlFor={option.value}
                  >
                    {option.label}
                    <span className="fr-hint-text">
                      {option.subLabel}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        ) : (
          <div className="fr-tags-group">
            {(fraisACharge && fraisACharge.length > 0 ? fraisACharge : ['Non renseigné']).map((frais) => (
              <span
                className="fr-tag fr-tag--mg"
                key={frais}
              >
                {frais}
              </span>
            ))}
          </div>
        )}
      </div>

      {isEditing
        ? (
          <div className="fr-btns-group fr-btns-group--inline-sm fr-mt-3w">
            <button
              className="fr-btn fr-btn--secondary"
              disabled={isDisabled}
              onClick={handleCancel}
              type="button"
            >
              Annuler
            </button>
            <button
              className="fr-btn"
              disabled={isDisabled}
              type="submit"
            >
              {isDisabled ? 'Enregistrement en cours...' : 'Enregistrer'}
            </button>
          </div>
        )
        : null}
    </form>
  )
}

type Props = Readonly<{
  email?: string
  fraisACharge?: ReadonlyArray<string>
  modalitesAcces?: ReadonlyArray<string>
  peutModifier: boolean
  telephone?: string
}>
