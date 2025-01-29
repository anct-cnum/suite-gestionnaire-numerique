'use client'

import { ReactElement, useId } from 'react'

import styles from './Membres.module.css'
import Table from '@/components/shared/Table/Table'
import Badge from '@/components/shared/Badge/Badge'

export default function Membres(): ReactElement {
  const labelId = useId()
  const selectRoleId = useId()
  const selectTypologieId = useId()

  return (
    <>
      <div className="fr-grid-row fr-btns-group--between fr-grid-row--middle">
        <h1 className="color-blue-france fr-mt-5w">
          Gérer les membres · Rhône
        </h1>
        <button className="fr-btn fr-btn--primary fr-btn--icon-left fr-icon-add-line">
          Ajouter un membre
        </button>
      </div>
      <div className="fr-tabs fr-tabs__list fr-pb-0">
        <ul className="fr-nav__list">
          {statuts.map(([title, count, isActive]) => (
            <li
              className="fr-nav__item"
              role="presentation"
            >
              <button
                aria-current={isActive ? 'page' : false}
                className="fr-nav__link fr-nav__link"
                role="tab"
                type="button"
              >
                {title}
                {' '}
                ·
                {count}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="fr-grid-row fr-btns-group--between fr-mt-4w">
        <div className="fr-tags-group">
          <label id={labelId}>
            Filtres :
          </label>
          <div className={`fr-tag fr-accordion__btn color-blue-france ${styles.selecteur}`}>
            <select
              aria-labelledby="labelid"
              className="fr-tag--sm"
              id={selectRoleId}
              name="select"
            >
              <option
                disabled
                selected
                value=""
              >
                Rôles
              </option>
              {roles.map((role, index) => (
                <option value={index}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div className={`fr-tag  fr-accordion__btn color-blue-france ${styles.selecteur}`}>
            <select
              aria-labelledby="labelid"
              className="fr-tag--sm"
              id={selectTypologieId}
              name="select"
            >
              <option
                className="color-blue-france"
                disabled
                selected
                value=""
              >
                Typologie
              </option>
              {types.map((typologie) => (
                <option value={typologie.value}>
                  {typologie.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button className="fr-mb-2w fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-download-line">
          Exporter
        </button>
      </div>
      <Table
        enTetes={['Structure', 'Contact référent', 'Rôles', '']}
        titre="Mes utilisateurs"
      >
        {membres.map((membre, i) => (
          <tr
            data-row-key={i}
            id={`table-sm-row-key-${i}`}
            key={i}
          >
            <td>
              <div className="font-weight-700">
                {membre.nom}
              </div>
              {membre.type}
            </td>
            <td>
              {membre.contact}
            </td>
            <td>
              {membre.roles.map(role => (
                <Badge color={role.color}>
                {role.name}
              </Badge>
              ))}
            </td>
            <td className="fr-cell--center">
              <button
                className="fr-btn fr-btn--tertiary"
                disabled={false}
                title="Supprimer"
                type="button"
              >
                <span
                  aria-hidden="true"
                  className="fr-icon-delete-line color-red"
                />
              </button>
            </td>
          </tr>
        ))}
      </Table>
    </>
  )
}

type Role = Readonly<{
  name: string
  plural: string
  value: string
  color: string
}>

const coPorteur: Role = {
  name: 'Co-porteur',
  plural: 'Co-porteurs',
  value: 'coporteur',
  color: 'info'
}

const coFinanceur: Role = {
  name: 'Co-financeur',
  plural: 'Co-financeurs',
  value: 'cofinanceur',
  color: 'warning'
}

const beneficiaire: Role = {
  name: 'Bénéficiaire',
  plural: 'Bénéficiaires',
  value: 'beneficiaire',
  color: 'error'
}

const formation: Role = {
  name: 'Formation',
  plural: 'Formations',
  value: 'formation',
  color: 'success'
}

const observateur: Role = {
  name: 'Observateur',
  plural: 'Observateurs',
  value: 'observateur',
  color: 'new'
}

const membres = [
  {
    contact: 'Laetitia Henrich',
    nom: 'Préfecture du Rhône',
    roles: [coPorteur],
    type: 'Préfecture départementale',
  },
  {
    contact: 'Pauline Chappuis',
    nom: 'Rhône (69)',
    roles: [coPorteur, coFinanceur],
    type: 'Collectivité, conseil départemental',
  },
  {
    contact: 'Blaise Boudet',
    nom: 'CC des Monts du Lyonnais',
    roles: [coPorteur, coFinanceur],
    type: 'Collectivité, EPCI',
  },
  {
    contact: 'Gaby Vasseur',
    nom: "La Voie du Num'",
    roles: [beneficiaire, formation],
    type: 'Association',
  },
  {
    contact: 'Fabien Beauvilliers',
    nom: 'Fédération départementale des centres sociaux du Rhône et de la Métropole de Lyon',
    roles: [formation],
    type: 'Association',
  },
  {
    contact: 'Grégory Geffroy',
    nom: 'Info-Jeunes Auvergne Rhône-Alpes (CRIJ)',
    roles: [beneficiaire, formation],
    type: 'Association',
  },
  {
    contact: 'Ninon Poulin',
    nom: 'Emmaüs Connect',
    roles: [observateur],
    type: 'Association',
  },
  {
    contact: 'Arianne Dufour',
    nom: 'Croix Rouge Française',
    roles: [coFinanceur],
    type: 'Association',
  },
  {
    contact: 'Fabien Pélissier',
    nom: 'Orange',
    roles: [coPorteur],
    type: 'Entreprise privée',
  },
]

const statuts: ReadonlyArray<Readonly<[string, number, boolean]>> = [
  ['Membres', 9, true],
  ['Suggestions', 2, false],
  ['Candidats', 8, false],
]

const roles = [
  'Bénéficiaires',
  'Co-financeurs',
  'Observateurs',
  'Formation',
  'Co-porteurs',
]

const types = [
  {label: 'Préfecture départmentale', value: 'prefecture-departementale'},
  {label: 'Conseils départementail', value: 'conseil-departemental'},
  {label: 'EPCIS', value:'epcis'},
  {label: 'Associations', value:'associations'},
  {label: 'Entreprises privées', value:'entreprises-privees'},
]
