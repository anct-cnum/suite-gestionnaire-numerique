import Link from 'next/link'
import { ReactElement, RefObject, useId, useRef, useState } from 'react'

import styles from './Action.module.css'
import Checkbox from '../shared/Checkbox/Checkbox'
import Drawer from '../shared/Drawer/Drawer'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import Statut from '../shared/Statut/Statut'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { Beneficiaires, Porteurs } from '@/presenters/actionPresenter'

export default function AjouterDesMembres({
  checkboxName,
  drawerId,
  labelPluriel,
  membres,
  titre,
  toutEffacer,
  urlGouvernance,
}: Props): ReactElement {
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const labelId = useId()
  const fieldset = useRef<HTMLFieldSetElement>(null)
  const hasMembres = membres.filter((membre) => membre.isChecked).length > 0

  return (
    <>
      <button
        aria-controls={drawerId}
        className={hasMembres ? 'fr-btn fr-btn--tertiary' : 'fr-btn fr-btn--primary fr-btn--icon-left fr-fi-add-line'}
        data-fr-opened="false"
        onClick={() => {
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
          {
            membres.map((membre) => (
              <Checkbox
                defaultChecked={membre.isChecked}
                id={membre.value}
                key={membre.value}
                label={
                  <>
                    <span>
                      {membre.label}
                    </span>
                    <Statut
                      color={membre.color}
                      libelle={membre.statut}
                    />
                  </>
                }
                name={checkboxName}
                value={membre.value}
              />
            ))
          }
          <div className="fr-btns-group">
            <button
              aria-controls={drawerId}
              className="fr-btn"
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
  labelPluriel: string
  membres: Beneficiaires | Porteurs
  titre: string
  urlGouvernance: string
  toutEffacer(fieldset: RefObject<HTMLFieldSetElement | null>): () => void
}>
