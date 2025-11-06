'use client'
import { usePathname } from 'next/navigation'
import { ComponentType, FormEvent, ReactElement, useContext, useMemo, useState } from 'react'

import styles from './LieuInclusionDetailsServicesTypeAccompagnement.module.css'
import { ServiceInclusionNumeriqueData } from '@/components/LieuInclusionDetails/LieuInclusionDetails'
import sharedStyles from '@/components/LieuInclusionDetails/LieuInclusionDetailsShared.module.css'
import { clientContext } from '@/components/shared/ClientContext'
import { Notification } from '@/components/shared/Notification/Notification'
import { InternetIcon } from '@/shared/pictograms/digital/InternetIcon'
import { SittingAtATableIcon } from '@/shared/pictograms/user/SittingAtATableIcon'
import { TeacherIcon } from '@/shared/pictograms/user/TeacherIcon'
import { PairIcon } from '@/shared/pictograms/work/PairIcon'

export default function LieuInclusionDetailsServicesTypeAccompagnement(props: Props): ReactElement {
  const { data, modalitesAccueil, peutModifier } = props
  const [isEditing, setIsEditing] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)

  const { modifierLieuInclusionServicesTypeAccompagnementAction } = useContext(clientContext)
  const pathname = usePathname()

  // Extraire l'ID de structure depuis l'URL (/lieu/[id])
  const structureId = pathname.split('/').pop() ?? ''

  const allThematiques = data.flatMap(service => service.thematiques)
  const uniqueThematiques = useMemo(() => [...new Set(allThematiques)], [allThematiques.join(',')])

  // State pour gérer les thématiques sélectionnées en mode édition
  const [selectedThematiques, setSelectedThematiques] = useState<Array<string>>(() => [...uniqueThematiques])

  // Liste complète des thématiques disponibles
  const thematiquesDisponibles = [
    'Aide aux démarches administratives',
    'Maîtrise des outils numériques du quotidien',
    'Insertion professionnelle via le numérique',
    'Utilisation sécurisée du numérique',
    'Parentalité et éducation avec le numérique',
    'Loisirs et créations numériques',
    'Compréhension du monde numérique',
    'Accès internet et matériel informatique',
    'Acquisition de matériel informatique à prix solidaire',
  ]

  const typesAccompagnementIcons: Record<string, ComponentType<{ height?: number; width?: number }>> = {
    'Accompagnement individuel': SittingAtATableIcon,
    'À distance': InternetIcon,
    // eslint-disable-next-line sort-keys -- sort-keys and perfectionist use different sorting for accents
    'Atelier collectif': TeacherIcon,
    'En autonomie': PairIcon,
  }

  const allModalites = data.flatMap(service => service.modalites)
  const uniqueModalites = [...new Set(allModalites)]

  // Récupérer les types d'accompagnement depuis modalites_accompagnement
  // (qui sont stockés dans modalites dans ServiceInclusionNumeriqueData)
  const typeAccompagnements: ReadonlyArray<{
    dbValue: string
    label: string
    subLabel?: string
    value: string
  }> = [
    {
      dbValue: 'En autonomie',
      label: 'En autonomie',
      value: 'en-autonomie',
    },
    {
      dbValue: 'Accompagnement individuel',
      label: 'Accompagnement individuel',
      value: 'accompagnement-individuel',
    },
    {
      dbValue: 'Atelier collectif',
      label: 'Atelier collectif',
      value: 'atelier-collectif',
    },
    {
      dbValue: 'À distance',
      label: 'À distance',
      subLabel: 'par téléphone ou en visioconférence',
      value: 'a-distance',
    },
  ]

  // Récupérer les types d'accompagnement existants depuis modalitesAccueil
  // modalitesAccueil contient une string avec les modalités séparées par des virgules
  const existingTypesAccompagnementFromDB = modalitesAccueil !== undefined && modalitesAccueil !== ''
    ? modalitesAccueil.split(',').map(modalite => modalite.trim())
    : []

  // Convertir les valeurs DB en values pour le formulaire
  const existingTypesAccompagnement = existingTypesAccompagnementFromDB
    .map(dbValue => typeAccompagnements.find(type => type.dbValue === dbValue)?.value)
    .filter((value): value is string => value !== undefined)

  function handleThematiqueSelect(event: React.ChangeEvent<HTMLSelectElement>): void {
    const selectedValue = event.target.value
    if (selectedValue !== '' && !selectedThematiques.includes(selectedValue)) {
      setSelectedThematiques((prev) => [...prev, selectedValue])
    }
    // Reset select après ajout
    event.target.value = ''
  }

  function handleRemoveThematique(thematiqueToRemove: string): void {
    setSelectedThematiques((prev) => prev.filter(thematique => thematique !== thematiqueToRemove))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const typesAccompagnementValues = form.getAll('types-accompagnement') as ReadonlyArray<string>

    // Convertir les values en dbValues pour la sauvegarde
    const typesAccompagnementDB = typesAccompagnementValues
      .map(value => typeAccompagnements.find(type => type.value === value)?.dbValue)
      .filter((dbValue): dbValue is string => dbValue !== undefined)

    setIsDisabled(true)

    const messages = await modifierLieuInclusionServicesTypeAccompagnementAction({
      modalites: uniqueModalites,
      path: pathname,
      structureId,
      thematiques: selectedThematiques,
      typesAccompagnement: [...typesAccompagnementDB],
    })

    if (messages.includes('OK')) {
      Notification('success', { description: 'modifiés', title: 'Services et types d\'accompagnement ' })
      setIsEditing(false)
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }

    setIsDisabled(false)
  }

  function handleCancel(): void {
    // Restaurer les thématiques originales
    setSelectedThematiques([...uniqueThematiques])
    setIsEditing(false)
  }

  function handleEditClick(): void {
    // Réinitialiser les thématiques sélectionnées avec les valeurs actuelles
    setSelectedThematiques([...uniqueThematiques])
    setIsEditing(true)
  }

  function renderThematiques(): ReactElement {
    if (isEditing) {
      return (
        <>
          <select
            className="fr-select"
            id="thematiques-select"
            onChange={handleThematiqueSelect}
          >
            <option value="">
              Choisissez un ou plusieurs types
            </option>
            {thematiquesDisponibles
              .filter(thematique => !selectedThematiques.includes(thematique))
              .map((thematique) => (
                <option
                  key={thematique}
                  value={thematique}
                >
                  {thematique}
                </option>
              ))}
          </select>
          {selectedThematiques.length > 0 ? (
            <div
              className="fr-tags-group fr-mt-2w"
              key={`tags-${selectedThematiques.length}`}
              style={{ flexWrap: 'wrap' }}
            >
              {selectedThematiques.map((thematique) => (
                <button
                  className="fr-tag fr-tag--dismiss"
                  key={thematique}
                  onClick={(event) => {
                    event.preventDefault()
                    handleRemoveThematique(thematique)
                  }}
                  type="button"
                >
                  {thematique}
                </button>
              ))}
            </div>
          ) : null}
        </>
      )
    }

    return (
      <ul>
        {uniqueThematiques.length > 0 ? uniqueThematiques.map((thematique) => (
          <li key={thematique}>
            •
            {' '}
            {thematique}
          </li>
        )) : (
          <li>
            Aucune thématique renseignée
          </li>
        )}
      </ul>
    )
  }

  function renderTypesAccompagnement(): ReactElement {
    if (isEditing) {
      return (
        <fieldset className="fr-fieldset">
          <div className="fr-fieldset__content">
            {typeAccompagnements.map((type) => (
              <div
                className="fr-checkbox-group"
                key={type.value}
              >
                <input
                  defaultChecked={existingTypesAccompagnement.includes(type.value)}
                  id={type.value}
                  name="types-accompagnement"
                  type="checkbox"
                  value={type.value}
                />
                <label
                  className="fr-label"
                  htmlFor={type.value}
                >
                  {type.label}
                  {type.subLabel !== undefined && type.subLabel !== '' ? (
                    <span className="fr-hint-text">
                      {type.subLabel}
                    </span>
                  ) : null}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      )
    }

    if (existingTypesAccompagnement.length > 0) {
      const selectedTypes = typeAccompagnements
        .filter((type) => existingTypesAccompagnement.includes(type.value))
        .map((type) => type.label)

      return (
        <ul className={styles.typesList}>
          {selectedTypes.map((typeAccompagnement) => {
            const Icon = typesAccompagnementIcons[typeAccompagnement]
            return (
              <li
                className={styles.typeItem}
                key={typeAccompagnement}
              >
                <Icon
                  height={36}
                  width={36}
                />
                {typeAccompagnement}
              </li>
            )
          })}
        </ul>
      )
    }

    return (
      <p className="fr-text--sm">
        Aucun type d&apos;accompagnement renseigné
      </p>
    )
  }

  return (
    <form
      className="fr-p-4w"
      onSubmit={handleSubmit}
    >
      <div className="fr-grid-row fr-grid-row--gutters fr-pb-2w">
        <div className="fr-col fr-col-12 fr-col-md-8">
          <h4 className="fr-h6 fr-mb-1v">
            Services & types d&apos;accompagnement
          </h4>
          <p className={`fr-text--sm fr-mb-2w ${sharedStyles.subtitleGrey}`}>
            Renseigner les les services et les types d&apos;accompagnements proposés dans ce lieu.
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
        <h5 className="fr-text--md fr-mb-1w">
          Thématiques des services d&apos;inclusion numérique
        </h5>
        <p className="fr-text--sm fr-mb-2w">
          Renseigner les services proposés dans ce lieu.
        </p>
        {renderThematiques()}
      </div>

      <div className="fr-mb-3w">
        <p className="fr-text">
          Types d&apos;accompagnements proposés
        </p>
        {renderTypesAccompagnement()}
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
  data: ReadonlyArray<ServiceInclusionNumeriqueData>
  modalitesAccueil?: string
  peutModifier: boolean
}>
