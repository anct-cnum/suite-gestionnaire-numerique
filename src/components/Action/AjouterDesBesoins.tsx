import { ReactElement, RefObject, useId, useRef, useState } from 'react'

import styles from './Action.module.css'
import Checkbox from '../shared/Checkbox/Checkbox'
import Drawer from '../shared/Drawer/Drawer'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { ActionViewModel, Besoins } from '@/presenters/actionPresenter'

export default function AjouterDesBesoins({
  financements,
  formations,
  formationsProfesionnels,
  hasBesoins,
  outillages,
  toutEffacer,
}: Props): ReactElement {
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const drawerId = 'drawerAjouterDesBesoinsId'
  const labelId = useId()
  const fieldset = useRef<HTMLFieldSetElement>(null)

  return (
    <>
      <button
        aria-controls={drawerId}
        className={
          hasBesoins ?
            'fr-btn fr-btn--tertiary' :
            'fr-btn fr-btn--primary fr-btn--icon-left fr-fi-add-line'
        }
        data-fr-opened="false"
        onClick={() => {
          setIsDrawerOpen(true)
        }}
        title="Ajouter des besoins"
        type="button"
      >
        {hasBesoins ? 'Modifier' : 'Ajouter'}
      </button>
      <Drawer
        boutonFermeture="Fermer l’ajout des besoins"
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
          <TitleIcon
            background="purple"
            icon="flashlight-line"
          />
          <br />
          Ajouter le(s) besoin(s)
        </DrawerTitle>
        <p className="fr-text--sm color-grey">
          Sélectionnez au moins un besoin.
        </p>
        <fieldset
          className={styles['no-border']}
          ref={fieldset}
        >
          <legend className="fr-sr-only">
            Les différents besoins
          </legend>
          <Fieldset
            checkboxes={formations}
            titre="Besoin relatif à la formation des feuilles de route"
          />
          <hr />
          <Fieldset
            checkboxes={financements}
            titre="Besoin relatif au financement du déploiement"
          />
          <hr />
          <Fieldset
            checkboxes={outillages}
            titre="Besoin relatif à l’outillage des acteurs"
          />
          <hr />
          <Fieldset
            checkboxes={formationsProfesionnels}
            titre="Besoins relatifs à la formation des professionnels de l’inclusion numérique"
          />
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

function Fieldset(
  { titre, checkboxes }:
  Readonly<{ titre: string; checkboxes: Besoins }>
): ReactElement {
  return (
    <fieldset className="fr-fieldset">
      <legend className="fr-fieldset__legend--regular fr-fieldset__legend color-blue-france font-weight-700">
        {titre}
      </legend>
      {
        checkboxes.map((checkbox) => (
          <Checkbox
            defaultChecked={checkbox.isChecked}
            id={checkbox.value}
            key={checkbox.value}
            label={checkbox.label}
            name="besoins"
            value={checkbox.value}
          />
        ))
      }
    </fieldset>
  )
}

type Props = Readonly<{
  financements: ActionViewModel['besoins']['financements']
  hasBesoins: boolean
  formations: ActionViewModel['besoins']['formations']
  formationsProfesionnels: ActionViewModel['besoins']['formationsProfessionnels']
  outillages: ActionViewModel['besoins']['outillages']
  toutEffacer(fieldset: RefObject<HTMLFieldSetElement | null>): () => void
}>
