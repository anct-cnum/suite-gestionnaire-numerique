'use client'

import { ReactElement, useContext } from 'react'

import Checkbox from '../shared/Checkbox/Checkbox'
import { clientContext } from '../shared/ClientContext'

export default function FiltrerParRoles(): ReactElement {
  const { searchParams } = useContext(clientContext)
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
  )
}
