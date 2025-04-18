'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ReactElement, RefObject, useEffect, useId, useRef, useState } from 'react'

import styles from './Action.module.css'
import Badge from '../shared/Badge/Badge'
import Checkbox from '../shared/Checkbox/Checkbox'
import Drawer from '../shared/Drawer/Drawer'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import Spinner from '@/components/spinner/Spinner'
import { MembresGouvernancesViewModel } from '@/presenters/membresGouvernancesPresenter'

export default function AjouterDesMembres({
  checkboxName,
  drawerId,
  enregistrer,
  labelPluriel,
  preSelectedMembers,
  titre,
  toutEffacer,
  urlGouvernance,
}: Props): ReactElement {
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const labelId = useId()
  const fieldset = useRef<HTMLFieldSetElement>(null)

  const params = useParams()
  const codeDepartement = params.codeDepartement
  const [gouvernanceMembers, setGouvernanceMembers] =
    useState(Array<MembresGouvernancesViewModel>())
  const [loading, setLoading] = useState(true)
  const hasMembres = preSelectedMembers.length > 0
  useEffect(() => {
    if (!isDrawerOpen) {
      return
    }
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/gouvernance/${codeDepartement}/members`, {
          credentials: 'include',
        })
        const membresGouvernancesViewModels =
          (await res.json()) as Array<MembresGouvernancesViewModel>
        setGouvernanceMembers(membresGouvernancesViewModels)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isDrawerOpen])

  return (
    <>
      <button
        aria-controls={drawerId}
        className={
          hasMembres
            ? 'fr-btn fr-btn--tertiary'
            : 'fr-btn fr-btn--primary fr-btn--icon-left fr-fi-add-line'
        }
        data-fr-opened="false"
        onClick={() => {
          setIsDrawerOpen(() => true)
        }}
        title={`Ajouter des ${labelPluriel}`}
        type="button"
      >
        {hasMembres ? 'Modifier' : 'Ajouter'}
      </button>
      <Drawer
        boutonFermeture={`Fermer l’ajout des ${labelPluriel}`}
        closeDrawer={() => {
          setIsDrawerOpen(() => false)
        }}
        id={drawerId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelId}
      >
        <DrawerTitle id={labelId}>
          <TitleIcon icon="building-line" />
          <br />
          {titre}
        </DrawerTitle>
        <p className="fr-text--sm color-grey">
          Sélectionnez un ou plusieurs
          {' '}
          {labelPluriel}
          {' '}
          pour cette action.
          Si vous ne trouvez pas la structure dans cette liste, invitez-la à rejoindre la gouvernance en
          {' '}
          <Link
            className="color-blue-france"
            href={urlGouvernance}
          >
            cliquant ici
          </Link>
          .
        </p>
        <fieldset
          className={`${styles['no-border']} ${styles.separator}`}
          ref={fieldset}
        >
          <legend className="fr-sr-only">
            Les différents
            {' '}
            {labelPluriel}
          </legend>
          {loading ? (
            <Spinner />
          ) : (
            gouvernanceMembers.map((membre) => (
              <Checkbox
                id={membre.uid}
                isSelected={preSelectedMembers.some((x) => x.uid === membre.uid)}
                key={membre.nom}
                label={checkboxName}
                value={membre.nom}
              >
                <span>{membre.nom}</span>
                <span>
                  {membre.roles.map((role) => (
                    <Badge color={role.color} key={role.nom + role.color}>
                      {role.nom}
                    </Badge>
                  ))}
                </span>
              </Checkbox>
            ))
          )}

          <div className="fr-btns-group">
            <button
              aria-controls={drawerId}
              className="fr-btn"
              onClick={enregistrer(fieldset)}
              type="button"
            >
              Enregistrer
            </button>
            <button
              className="fr-btn fr-btn--secondary"
              onClick={toutEffacer(fieldset)}
              type="button"
            >
              Tout effacer
            </button>
          </div>
        </fieldset>
      </Drawer>
    </>
  )
}

type Props = Readonly<{
  checkboxName: string
  drawerId: string
  enregistrer(fieldset: RefObject<HTMLFieldSetElement | null>): () => void
  labelPluriel: string
  preSelectedMembers: Array<MembresGouvernancesViewModel>
  titre: string
  toutEffacer(fieldset: RefObject<HTMLFieldSetElement | null>): () => void
  urlGouvernance: string
}>
