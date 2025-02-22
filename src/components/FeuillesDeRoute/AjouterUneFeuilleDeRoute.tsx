'use client'

import { FormEvent, ReactElement, useContext, useId, useRef, useState } from 'react'

import { clientContext } from '../shared/ClientContext'
import Drawer from '../shared/Drawer/Drawer'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import Icon from '../shared/Icon/Icon'
import { Notification } from '../shared/Notification/Notification'
import RadioGroup from '../shared/Radio/RadioGroup'
import Select from '../shared/Select/Select'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import TextInput from '../shared/TextInput/TextInput'
import { FeuillesDeRouteViewModel } from '@/presenters/feuillesDeRoutePresenter'

export default function AjouterUneFeuilleDeRoute({
  contratPreexistant,
  membres,
  perimetres,
  uidGouvernance,
}: Props): ReactElement {
  const { ajouterUneFeuilleDeRouteAction, pathname } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const drawerId = 'drawerAjouterFeuilleDeRouteId'
  const labelId = useId()
  const nomId = useId()
  const drawerRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button
        aria-controls={drawerId}
        className="fr-btn fr-btn--secondary fr-btn--icon-left fr-fi-add-line"
        data-fr-opened="false"
        onClick={() => {
          setIsDrawerOpen(true)
        }}
        type="button"
      >
        Ajouter une feuille de route
      </button>
      <Drawer
        boutonFermeture="Fermer le formulaire d’ajout d’une feuille de route"
        closeDrawer={() => {
          setIsDrawerOpen(false)
        }}
        id={drawerId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelId}
        ref={drawerRef}
      >
        <DrawerTitle id={labelId}>
          <Icon icon="survey-line" />
          <br />
          Ajouter une feuille de route
        </DrawerTitle>
        <p className="fr-text--sm color-grey">
          Les champs avec
          {' '}
          <span className="color-red">
            *
          </span>
          {' '}
          sont obligatoires.
        </p>
        <form
          aria-label="Ajouter"
          method="dialog"
          onSubmit={ajouterUneFeuilleDeRoute}
        >
          <TextInput
            id={nomId}
            name="nom"
            required={true}
          >
            Quel est le nom de la feuille de route ?
            {' '}
            <span className="color-red">
              *
            </span>
          </TextInput>
          <Select
            defaultValue=""
            id="membres"
            name="membre"
            options={[{ label: 'Choisir', uid: '' }].concat(membres)}
            required={true}
          >
            Quel membre de la gouvernance porte la feuille de route ?
            {' '}
            <span className="color-red">
              *
            </span>
          </Select>
          <fieldset className="fr-fieldset">
            <legend className="fr-mb-2w">
              Quel est le périmètre géographique de la feuille de route ?
              {' '}
              <span className="color-red">
                *
              </span>
            </legend>
            <RadioGroup
              nomGroupe="perimetre"
              options={perimetres}
            />
          </fieldset>
          <fieldset className="fr-fieldset">
            <legend className="fr-mb-2w">
              La feuille de route s’appuie-t-elle sur un contrat préexistant ?
              {' '}
              <span className="color-red">
                *
              </span>
            </legend>
            <RadioGroup
              nomGroupe="contratPreexistant"
              options={contratPreexistant}
            />
          </fieldset>
          <div className="fr-btns-group">
            <SubmitButton isDisabled={isDisabled}>
              {isDisabled ? 'Ajout en cours...' : 'Enregistrer'}
            </SubmitButton>
          </div>
        </form>
      </Drawer>
    </>
  )

  async function ajouterUneFeuilleDeRoute(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    setIsDisabled(true)
    const form = new FormData(event.currentTarget)
    const [nom, membre, perimetre, contratPreexistant] = form.values() as FormDataIterator<string>
    const messages = await ajouterUneFeuilleDeRouteAction({
      contratPreexistant,
      nom,
      path: pathname,
      perimetre,
      uidGouvernance,
      uidMembre: membre,
    })
    if (messages.includes('OK')) {
      Notification('success', { description: 'ajoutée', title: 'Feuille de route ' })
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
    setIsDrawerOpen(false);
    (event.target as HTMLFormElement).reset()
    // eslint-disable-next-line no-restricted-syntax
    window.dsfr(drawerRef.current).modal.conceal()
    setIsDisabled(false)
  }
}

type Props = Readonly<{
  contratPreexistant: FeuillesDeRouteViewModel['contratPreexistant']
  membres: FeuillesDeRouteViewModel['membres']
  perimetres: FeuillesDeRouteViewModel['perimetres']
  uidGouvernance: string
}>
