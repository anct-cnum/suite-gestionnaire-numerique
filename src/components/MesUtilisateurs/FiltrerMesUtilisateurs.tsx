'use client'

import { Dispatch, FormEvent, ReactElement, SetStateAction, useContext, useId } from 'react'

import Checkbox from '../shared/Checkbox/Checkbox'
import { clientContext } from '../shared/ClientContext'
import Interrupteur from '../shared/Interrupteur/Interrupteur'

export default function FiltrerMesUtilisateurs({
  id,
  labelId,
  setIsOpen,
}: FiltrerMesUtilisateursProps): ReactElement {
  const { router, searchParams } = useContext(clientContext)
  const utilisateursActivesToggleId = useId()
  const isUtilisateursActivesChecked = searchParams.get('utilisateursActives') === 'on'
  const roles = searchParams.getAll('roles').at(0)?.split(',')

  let isAdministrateurDispositifChecked = true
  let isGestionnaireDepartementChecked = true
  let isGestionnaireGroupementChecked = true
  let isGestionnaireRegionChecked = true
  let isGestionnaireStructureChecked = true
  let isInstructeurChecked = true
  let isPilotePolitiquePubliqueChecked = true
  let isSupportAnimationChecked = true
  if (roles) {
    isAdministrateurDispositifChecked = roles.includes('administrateur_dispositif')
    isGestionnaireDepartementChecked = roles.includes('gestionnaire_departement')
    isGestionnaireGroupementChecked = roles.includes('gestionnaire_groupement')
    isGestionnaireRegionChecked = roles.includes('gestionnaire_region')
    isGestionnaireStructureChecked = roles.includes('gestionnaire_structure')
    isInstructeurChecked = roles.includes('instructeur')
    isPilotePolitiquePubliqueChecked = roles.includes('pilote_politique_publique')
    isSupportAnimationChecked = roles.includes('support_animation')
  }

  return (
    <>
      <h1
        className="fr-h3 color-blue-france"
        id={labelId}
      >
        Filtrer
      </h1>
      <form
        aria-label="Filtrer"
        method="dialog"
        onSubmit={filtrer}
      >
        <Interrupteur
          defaultChecked={isUtilisateursActivesChecked}
          // Stryker disable next-line BooleanLiteral
          hasSeparator={true}
          id={utilisateursActivesToggleId}
          name="utilisateursActives"
        >
          Uniquement les utilisateurs activés
        </Interrupteur>
        <hr />
        <fieldset
          aria-labelledby="checkboxes-legend checkboxes-messages"
          className="fr-fieldset"
          id="checkboxes"
        >
          <legend
            className="fr-fieldset__legend--regular fr-fieldset__legend"
            id="checkboxes-legend"
          >
            Par rôles
          </legend>
          <Checkbox
            defaultChecked={isAdministrateurDispositifChecked}
            id="administrateur_dispositif"
            label="Administrateur dispositif"
            name="roles"
            value="administrateur_dispositif"
          />
          <Checkbox
            defaultChecked={isGestionnaireDepartementChecked}
            id="gestionnaire_departement"
            label="Gestionnaire département"
            name="roles"
            value="gestionnaire_departement"
          />
          <Checkbox
            defaultChecked={isGestionnaireGroupementChecked}
            id="gestionnaire_groupement"
            label="Gestionnaire groupement"
            name="roles"
            value="gestionnaire_groupement"
          />
          <Checkbox
            defaultChecked={isGestionnaireRegionChecked}
            id="gestionnaire_region"
            label="Gestionnaire région"
            name="roles"
            value="gestionnaire_region"
          />
          <Checkbox
            defaultChecked={isGestionnaireStructureChecked}
            id="gestionnaire_structure"
            label="Gestionnaire structure"
            name="roles"
            value="gestionnaire_structure"
          />
          <Checkbox
            defaultChecked={isInstructeurChecked}
            id="instructeur"
            label="Instructeur"
            name="roles"
            value="instructeur"
          />
          <Checkbox
            defaultChecked={isPilotePolitiquePubliqueChecked}
            id="pilote_politique_publique"
            label="Pilote politique publique"
            name="roles"
            value="pilote_politique_publique"
          />
          <Checkbox
            defaultChecked={isSupportAnimationChecked}
            id="support_animation"
            label="Support animation"
            name="roles"
            value="support_animation"
          />
        </fieldset>
        <div className="fr-btns-group fr-btns-group--space-between">
          <button
            className="fr-btn fr-btn--secondary fr-col-5"
            onClick={() => {
              router.push('/mes-utilisateurs')
            }}
            type="reset"
          >
            Réinitialiser les filtres
          </button>
          <button
            aria-controls={id}
            className="fr-btn fr-col-5"
            type="submit"
          >
            Afficher les utilisateurs
          </button>
        </div>
      </form>
    </>
  )

  function filtrer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Stryker disable next-line BooleanLiteral
    setIsOpen(false)

    const form = new FormData(event.currentTarget)
    const utilisateursActives = form.get('utilisateursActives') as string
    const roles = form.getAll('roles') as Array<string>

    const url = new URL('/mes-utilisateurs', process.env.NEXT_PUBLIC_HOST)

    if (utilisateursActives === 'on') {
      url.searchParams.append('utilisateursActives', utilisateursActives)
    }

    if (roles.length < 8) {
      url.searchParams.append('roles', roles.join(','))
    }

    router.push(url.toString())
  }
}

type FiltrerMesUtilisateursProps = Readonly<{
  id: string
  labelId: string
  setIsOpen: Dispatch<SetStateAction<boolean>>
}>
