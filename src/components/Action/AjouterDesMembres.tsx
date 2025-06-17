'use client'

import Link from 'next/link'
import { ReactElement, RefObject, useContext, useId, useRef, useState } from 'react'

import styles from './Action.module.css'
import Badge from '../shared/Badge/Badge'
import Checkbox from '../shared/Checkbox/Checkbox'
import Drawer from '../shared/Drawer/Drawer'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import { gouvernanceContext } from '../shared/GouvernanceContext'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { PorteurPotentielViewModel } from '@/presenters/shared/PorteurPotentiel'
import { RoleViewModel } from '@/presenters/shared/role'

export default function AjouterDesMembres({
  checkboxName,
  drawerId,
  enregistrer,
  labelPluriel,
  membres,
  resetToutEffacer,
  titre,
  toutEffacer,
  urlGestionMembresGouvernance,
}: Props): ReactElement {
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const labelId = useId()
  const fieldset = useRef<HTMLFieldSetElement>(null)

  const { gouvernanceViewModel } = useContext(gouvernanceContext)
  const membresGouvernanceConfirme = gouvernanceViewModel.porteursPotentielsNouvellesFeuillesDeRouteOuActions
  const hasMembres = membres.length > 0

  return (
    <>
      <button
        aria-controls={drawerId}
        className={hasMembres ? 'fr-btn fr-btn--tertiary' : 'fr-btn fr-btn--primary fr-btn--icon-left fr-fi-add-line'}
        data-fr-opened="false"
        onClick={() => {
          resetToutEffacer(fieldset)
          setIsDrawerOpen(true)
        }}
        title={`Ajouter des ${labelPluriel}`}
        type="button"
      >
        {hasMembres ? 'Modifier' : 'Ajouter'}
      </button>
      <Drawer
        boutonFermeture={`Fermer l’ajout des ${labelPluriel}`}
        closeDrawer={() => {
          setIsDrawerOpen(false)
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
            href={urlGestionMembresGouvernance}
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
          {
            membresGouvernanceConfirme.map((membre) => (
              <Checkbox
                id={checkboxName+membre.id}
                isSelected={membres.some( preSelectedMember => preSelectedMember.id === membre.id)}
                key={checkboxName+membre.id}
                label={checkboxName}
                value={membre.id}
              >
                {membre.nom}
                <div style={{ border: 'none', display: 'flex', flexDirection: 'row' }}>
                  {

                    membre.roles
                      .filter(role => role.nom !== 'Observateur' )
                      .map((role: RoleViewModel) => (
                        <Badge
                          color={role.color}
                          key={membre.id+ role.nom+role.color}
                        >
                          {role.nom}
                        </Badge>
                      ))
                  }
                </div>
              </Checkbox>
            ))
          }
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
  membres: Array<PorteurPotentielViewModel>
  resetToutEffacer(fieldset: RefObject<HTMLFieldSetElement | null>): void
  titre: string
  toutEffacer(fieldset: RefObject<HTMLFieldSetElement | null>): () => void
  urlGestionMembresGouvernance: string
}>
