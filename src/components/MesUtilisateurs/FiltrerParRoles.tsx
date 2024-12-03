'use client'

import { ReactElement, useContext } from 'react'

import Checkbox from '../shared/Checkbox/Checkbox'
import { clientContext } from '../shared/ClientContext'

export default function FiltrerParRoles(): ReactElement {
  const { searchParams } = useContext(clientContext)
  const roles = searchParams.getAll('roles').at(0)?.split(',')

  const checkboxes = [
    {
      label: 'Administrateur dispositif',
      value: 'administrateur_dispositif',
    },
    {
      label: 'Gestionnaire département',
      value: 'gestionnaire_departement',
    },
    {
      label: 'Gestionnaire groupement',
      value: 'gestionnaire_groupement',
    },
    {
      label: 'Gestionnaire région',
      value: 'gestionnaire_region',
    },
    {
      label: 'Gestionnaire structure',
      value: 'gestionnaire_structure',
    },
    {
      label: 'Instructeur',
      value: 'instructeur',
    },
    {
      label: 'Pilote politique publique',
      value: 'pilote_politique_publique',
    },
    {
      label: 'Support animation',
      value: 'support_animation',
    },
  ]

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
      {
        checkboxes.map((checkbox) => (
          <Checkbox
            defaultChecked={roles?.includes(checkbox.value) ?? true}
            id={checkbox.value}
            key={checkbox.value}
            label={checkbox.label}
            name="roles"
            value={checkbox.value}
          />
        ))
      }
    </fieldset>
  )
}
