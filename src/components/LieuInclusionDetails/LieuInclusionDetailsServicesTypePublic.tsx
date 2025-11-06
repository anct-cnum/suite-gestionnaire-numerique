'use client'

import { usePathname } from 'next/navigation'
import { FormEvent, ReactElement, useContext, useEffect, useState } from 'react'

import sharedStyles from '@/components/LieuInclusionDetails/LieuInclusionDetailsShared.module.css'
import { clientContext } from '@/components/shared/ClientContext'
import { Notification } from '@/components/shared/Notification/Notification'

export default function LieuInclusionDetailsServicesTypePublic(props: Props): ReactElement {
  const { peutModifier, priseEnChargeSpecifique, publicsSpecifiquementAdresses } = props
  const [isEditing, setIsEditing] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)

  const { modifierLieuInclusionServicesTypePublicAction } = useContext(clientContext)
  const pathname = usePathname()

  // Extraire l'ID de structure depuis l'URL (/lieu/[id])
  const structureId = pathname.split('/').pop() ?? ''

  // Liste des publics disponibles
  const publicsDisponibles: ReadonlyArray<{
    dbValue: string
    label: string
    subLabel?: string
    value: string
  }> = [
    {
      dbValue: 'Jeunes',
      label: 'Jeunes',
      value: 'jeunes',
    },
    {
      dbValue: 'Étudiants',
      label: 'Étudiants',
      value: 'etudiants',
    },
    {
      dbValue: 'Familles et/ou enfants',
      label: 'Familles et/ou enfants',
      value: 'familles-enfants',
    },
    {
      dbValue: 'Seniors',
      label: 'Seniors',
      value: 'seniors',
    },
    {
      dbValue: 'Femmes',
      label: 'Femmes',
      value: 'femmes',
    },
  ]

  // Liste des prises en charge spécifiques disponibles
  const prisesEnChargeDisponibles: ReadonlyArray<{
    dbValue: string
    label: string
    value: string
  }> = [
    {
      dbValue: 'Surdité',
      label: 'Surdité',
      value: 'surdite',
    },
    {
      dbValue: 'Handicaps moteurs',
      label: 'Handicaps moteurs',
      value: 'handicaps-moteurs',
    },
    {
      dbValue: 'Handicaps mentaux',
      label: 'Handicaps mentaux',
      value: 'handicaps-mentaux',
    },
    {
      dbValue: 'Langues étrangères (anglais)',
      label: 'Langues étrangères (anglais)',
      value: 'langues-etrangeres-anglais',
    },
    {
      dbValue: 'Langues étrangères (autres)',
      label: 'Langues étrangères (autres)',
      value: 'langues-etrangeres-autres',
    },
  ]

  // Convertir les valeurs DB en values pour le formulaire
  const existingPublics = (publicsSpecifiquementAdresses ?? [])
    .map(dbValue => publicsDisponibles.find(publicItem => publicItem.dbValue === dbValue)?.value)
    .filter((value): value is string => value !== undefined)

  // État pour gérer "Tout public" et les publics sélectionnés
  // "Tout public" est coché uniquement si TOUS les publics sont présents dans le tableau
  const allPublicsInDB = publicsDisponibles.every(publicItem =>
    (publicsSpecifiquementAdresses ?? []).includes(publicItem.dbValue))
  const [isToutPublic, setIsToutPublic] = useState(allPublicsInDB)

  // État pour les publics sélectionnés
  const [selectedPublics, setSelectedPublics] = useState<ReadonlyArray<string>>(() => {
    // Si tous les publics sont présents en DB, on les sélectionne tous
    if (allPublicsInDB) {
      return publicsDisponibles.map(publicDisponible => publicDisponible.value)
    }
    // Sinon on sélectionne uniquement ceux qui sont dans la liste (peut être vide)
    return existingPublics
  })

  // Synchroniser isToutPublic et selectedPublics avec les props quand on entre en mode édition
  useEffect(() => {
    if (isEditing) {
      // Recalculer si tous les publics sont présents
      const allPresent = publicsDisponibles.every(publicItem =>
        (publicsSpecifiquementAdresses ?? []).includes(publicItem.dbValue))
      setIsToutPublic(allPresent)

      if (allPresent) {
        // Si tous les publics sont présents, sélectionner tout
        setSelectedPublics(publicsDisponibles.map(publicItem => publicItem.value))
      } else {
        // Sinon, sélectionner uniquement ceux qui sont dans la liste
        const currentExistingPublics = (publicsSpecifiquementAdresses ?? [])
          .map(dbValue => publicsDisponibles.find(publicItem => publicItem.dbValue === dbValue)?.value)
          .filter((value): value is string => value !== undefined)
        setSelectedPublics(currentExistingPublics)
      }
    }
  }, [isEditing, publicsSpecifiquementAdresses])

  // Gérer le changement de "Tout public"
  function handleToutPublicChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const isChecked = event.target.checked
    setIsToutPublic(isChecked)

    // Si "Tout public" est coché, sélectionner tous les publics
    // Si "Tout public" est décoché, désélectionner tous les publics
    if (isChecked) {
      setSelectedPublics(publicsDisponibles.map(publicItem => publicItem.value))
    } else {
      setSelectedPublics([])
    }
  }

  // Gérer le changement d'un public spécifique
  function handlePublicSpecifiqueChange(publicValue: string, isChecked: boolean): void {
    let newSelectedPublics: ReadonlyArray<string>

    if (isChecked) {
      newSelectedPublics = [...selectedPublics, publicValue]
    } else {
      newSelectedPublics = selectedPublics.filter(value => value !== publicValue)
    }

    setSelectedPublics(newSelectedPublics)

    // Si toutes les checkboxes sont cochées, cocher "Tout public", sinon le décocher
    const allChecked = publicsDisponibles.every(publicItem => newSelectedPublics.includes(publicItem.value))
    setIsToutPublic(allChecked)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const form = new FormData(event.currentTarget)

    // Récupérer les publics sélectionnés depuis l'état (plus fiable que FormData)
    const publicsDB = selectedPublics
      .map(value => publicsDisponibles.find(publicItem => publicItem.value === value)?.dbValue)
      .filter((dbValue): dbValue is string => dbValue !== undefined)

    // Récupérer les prises en charge sélectionnées
    const prisesEnChargeValues = form.getAll('prises-en-charge') as ReadonlyArray<string>
    const prisesEnChargeDB = prisesEnChargeValues
      .map(value => prisesEnChargeDisponibles.find(pec => pec.value === value)?.dbValue)
      .filter((dbValue): dbValue is string => dbValue !== undefined)

    // Si "Tout public" est coché, envoyer TOUS les publics
    // Sinon, envoyer les publics sélectionnés (peut être un tableau vide si aucune sélection)
    const finalPublics = isToutPublic
      ? publicsDisponibles.map(publicItem => publicItem.dbValue)
      : publicsDB

    setIsDisabled(true)

    const messages = await modifierLieuInclusionServicesTypePublicAction({
      path: pathname,
      priseEnChargeSpecifique: [...prisesEnChargeDB],
      publicsSpecifiquementAdresses: [...finalPublics],
      structureId,
    })

    if (messages.includes('OK')) {
      Notification('success', { description: 'modifiés', title: 'Types de publics accueillis ' })
      setIsEditing(false)
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }

    setIsDisabled(false)
  }

  function handleCancel(): void {
    // Réinitialiser les états à leurs valeurs d'origine
    const allPresent = publicsDisponibles.every(publicItem =>
      (publicsSpecifiquementAdresses ?? []).includes(publicItem.dbValue))
    setIsToutPublic(allPresent)

    if (allPresent) {
      setSelectedPublics(publicsDisponibles.map(publicItem => publicItem.value))
    } else {
      setSelectedPublics(existingPublics)
    }

    setIsEditing(false)
  }

  function handleEditClick(): void {
    setIsEditing(true)
  }

  function renderPublicsDisplay(): ReactElement {
    if (allPublicsInDB) {
      return (
        <span className="fr-tag fr-tag--sm">
          <span className="fr-icon-user-heart-line fr-icon--mg fr-mr-1w"  />
          {' '}
          Tout public
        </span>
      )
    }

    if (publicsSpecifiquementAdresses !== undefined && publicsSpecifiquementAdresses.length > 0) {
      return (
        <div className="fr-tags-group">
          {publicsSpecifiquementAdresses.map((publicAdresse) => (
            <span
              className="fr-tag fr-tag--mg"
              key={publicAdresse}
            >
              {publicAdresse}
            </span>
          ))}
        </div>
      )
    }

    return (
      <p className="fr-text--sm">
        Aucun public spécifiquement renseigné.
      </p>
    )
  }

  function renderPrisesEnChargeDisplay(): ReactElement {
    if (priseEnChargeSpecifique !== undefined && priseEnChargeSpecifique.length > 0) {
      return (
        <div className="fr-tags-group">
          {priseEnChargeSpecifique.map((priseEnCharge) => (
            <span
              className="fr-tag fr-tag--mg"
              key={priseEnCharge}
            >
              {priseEnCharge}
            </span>
          ))}
        </div>
      )
    }

    return (
      <p className="fr-text--sm">
        Aucune prise en charge spécifique renseignée.
      </p>
    )
  }

  const existingPrisesEnCharge = (priseEnChargeSpecifique ?? [])
    .map(dbValue => prisesEnChargeDisponibles.find(pec => pec.dbValue === dbValue)?.value)
    .filter((value): value is string => value !== undefined)

  return (
    <form
      className="fr-p-4w"
      onSubmit={handleSubmit}
    >
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col fr-col-12 fr-col-md-8">
          <h4 className="fr-h6 fr-mb-1v">
            Types de publics accueillis
          </h4>
          <p className="fr-text--sm fr-mb-2w">
            Indiquez si ce lieu accueille des publics spécifiques
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
          <p className={`fr-text--sm fr-mb-3w ${sharedStyles.subtitleGrey}`}>
            Ces champs sont optionnels
          </p>
        )
        : null}

      <div className="fr-mb-3w">
        <h5 className="fr-text--md fr-mb-2w">
          Précisez les publics accueillis dans ce lieu
        </h5>
        {isEditing ? (
          <>
            <p className="fr-text--sm fr-mb-2w">
              Par défaut, un lieu d&apos;inclusion numérique est inclusif et peut accueillir tout public.
              Malgré tout, certains lieux sont habilités à recevoir exclusivement certains publics.
              Vous pouvez le préciser ici.
            </p>
            <fieldset className="fr-fieldset">
              <div className="fr-fieldset__content">
                {/* Checkbox "Tout public" */}
                <div className="fr-checkbox-group">
                  <input
                    checked={isToutPublic}
                    id="tout-public"
                    onChange={handleToutPublicChange}
                    type="checkbox"
                  />
                  <label
                    className="fr-label"
                    htmlFor="tout-public"
                  >
                    Tout public (tout sélectionner)
                  </label>
                </div>

                {/* Checkboxes des publics spécifiques */}
                {publicsDisponibles.map((publicItem) => (
                  <div
                    className="fr-checkbox-group"
                    key={publicItem.value}
                    style={{ marginLeft: '2rem' }}
                  >
                    <input
                      checked={selectedPublics.includes(publicItem.value)}
                      id={publicItem.value}
                      name="publics-specifiques"
                      onChange={(event) => {
                        handlePublicSpecifiqueChange(publicItem.value, event.target.checked)
                      }}
                      type="checkbox"
                      value={publicItem.value}
                    />
                    <label
                      className="fr-label"
                      htmlFor={publicItem.value}
                    >
                      {publicItem.label}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
          </>
        ) :
          renderPublicsDisplay()}
      </div>

      <div className="fr-mb-3w">
        <h5 className="fr-text--md fr-mb-2w">
          Prise en charge spécifique
        </h5>
        <p className="fr-text--sm fr-mb-2w">
          Indiquez si le lieu est en mesure d&apos;accompagner et soutenir des publics ayant des besoins particuliers.
        </p>

        {isEditing ? (
          <fieldset className="fr-fieldset">
            <div className="fr-fieldset__content">
              {prisesEnChargeDisponibles.map((pec) => (
                <div
                  className="fr-checkbox-group"
                  key={pec.value}
                >
                  <input
                    defaultChecked={existingPrisesEnCharge.includes(pec.value)}
                    id={pec.value}
                    name="prises-en-charge"
                    type="checkbox"
                    value={pec.value}
                  />
                  <label
                    className="fr-label"
                    htmlFor={pec.value}
                  >
                    {pec.label}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        ) :
          renderPrisesEnChargeDisplay()}
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
  peutModifier: boolean
  priseEnChargeSpecifique?: ReadonlyArray<string>
  publicsSpecifiquementAdresses?: ReadonlyArray<string>
}>
