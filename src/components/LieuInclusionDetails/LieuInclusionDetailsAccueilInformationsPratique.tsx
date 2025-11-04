'use client'

import { usePathname } from 'next/navigation'
import { FormEvent, ReactElement, useContext, useState } from 'react'

import EditHoraires, { transformHoraires } from '@/components/LieuInclusionDetails/EditHoraires'
import { LieuAccueilPublicData } from '@/components/LieuInclusionDetails/LieuInclusionDetails'
import { clientContext } from '@/components/shared/ClientContext'
import { Notification } from '@/components/shared/Notification/Notification'
import HorairesOuverture from '@/shared/components/HorairesOuverture/HorairesOuverture'

export default function LieuInclusionDetailsAccueilInformationsPratique(props: Props): ReactElement {
  const { data, peutModifier } = props
  const { horaires, itinerance, priseRdvUrl, websiteUrl } = data
  const [isEditing, setIsEditing] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)

  const { modifierLieuInclusionInformationsPratiquesAction } = useContext(clientContext)
  const pathname = usePathname()

  // Extraire l'ID de structure depuis l'URL (/lieu/[id])
  const structureId = pathname.split('/').pop() ?? ''

  // itinerance est un tableau, on vérifie s'il n'est pas vide pour l'affichage
  const isItinerant = itinerance !== undefined && itinerance.length > 0

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const websiteUrlValue = form.get('websiteUrl') as string
    const priseRdvUrlValue = form.get('priseRdvUrl') as string
    const horairesValue = transformHoraires(form)
    const itineranceValue = form.get('itinerance') === 'on' ? 'itinérant' : ''

    setIsDisabled(true)

    const messages = await modifierLieuInclusionInformationsPratiquesAction({
      horaires: horairesValue,
      itinerance: itineranceValue,
      path: pathname,
      priseRdvUrl: priseRdvUrlValue,
      structureId,
      websiteUrl: websiteUrlValue,
    })

    if (messages.includes('OK')) {
      Notification('success', { description: 'modifiées', title: 'Informations pratiques ' })
      setIsEditing(false)
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }

    setIsDisabled(false)
  }

  return (
    <form
      className="fr-p-4w"
      onSubmit={handleSubmit}
    >
      <div className="fr-grid-row fr-grid-row--middle fr-mb-2w">
        <div className="fr-col">
          <h3 className="fr-h6 fr-mb-0">
            Informations pratiques
          </h3>
          <p className="fr-text--sm fr-mb-0 fr-text-mention--grey">
            Horaires, accès et site internet du lieu
          </p>
        </div>
        {!isEditing && peutModifier ? (
          <div className="fr-col-auto">
            <button
              className="fr-link fr-icon-edit-fill fr-link--icon-right fr-mt-n2w"
              onClick={() => { setIsEditing(true) }}
              type="button"
            >
              Modifier
            </button>
          </div>
        ) : null}
      </div>

      {/* Site internet */}
      <div className="fr-mb-2w">
        <p className="fr-text--sm fr-mb-1v fr-text-mention--grey">
          Site internet du lieu
        </p>
        {
          isEditing
            ? (
              <input
                className="fr-input"
                defaultValue={websiteUrl}
                name="websiteUrl"
                placeholder="https://exemple.fr"
                type="url"
              />
            )
            : (
              <UrlDisplay url={websiteUrl} />
            )
        }
      </div>

      {/* Prise de RDV */}
      <div className="fr-mb-2w">
        <p className="fr-text--sm fr-mb-1v fr-text-mention--grey">
          Prise de rendez-vous en ligne
        </p>
        {
          isEditing
            ? (
              <input
                className="fr-input"
                defaultValue={priseRdvUrl}
                name="priseRdvUrl"
                placeholder="https://exemple.fr/rdv"
                type="url"
              />
            )
            : (
              <UrlDisplay url={priseRdvUrl} />
            )
        }
      </div>

      {/* Itinérance */}
      <div className="fr-mb-2w">
        <p className="fr-text--sm fr-mb-1v fr-text-mention--grey">
          Itinérance
        </p>
        {isEditing ? (
          <div className="fr-checkbox-group">
            <input
              defaultChecked={isItinerant}
              id="itinerance-checkbox"
              name="itinerance"
              type="checkbox"
            />
            <label
              className="fr-label"
              htmlFor="itinerance-checkbox"
            >
              Le lieu propose des services en itinérance
            </label>
          </div>
        ) : (
          <p className="fr-text--sm">
            {isItinerant ? 'Oui' : 'Non'}
          </p>
        )}
      </div>

      {/* Horaires */}
      <div className="fr-mb-2w">
        {
          isEditing
            ? (
              <EditHoraires horaires={horaires ?? ''} />
            )
            : (
              <HorairesOuverture horaires={horaires} />
            )
        }
      </div>

      {/* Boutons Annuler/Enregistrer */}
      {
        isEditing
          ? (
            <div className="fr-btns-group fr-btns-group--inline-sm">
              <button
                className="fr-btn fr-btn--secondary"
                disabled={isDisabled}
                onClick={() => { setIsEditing(false) }}
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
          : null
      }
    </form>
  )
}

function UrlDisplay(props: UrlDisplayProps): ReactElement {
  const { url } = props

  // Vérifier si l'URL est vide
  const isEmptyUrl = url === undefined || url === '' || url.trim() === ''

  if (isEmptyUrl) {
    return (
      <p className="fr-text--sm">
        Non renseigné
      </p>
    )
  }

  return (
    <a
      className="fr-link"
      href={url}
      rel="noopener noreferrer"
      target="_blank"
    >
      {url}
    </a>
  )
}

type UrlDisplayProps = Readonly<{
  url: string | undefined
}>

type Props = Readonly<{
  data: LieuAccueilPublicData
  peutModifier: boolean
}>
