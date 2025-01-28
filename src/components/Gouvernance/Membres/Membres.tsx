'use client'

import { ReactElement, useId } from 'react'

import Liste from './Liste'

export default function Membres(): ReactElement {
  const membres = 'membres'

  const labelId = useId()
  const selectRoleId = useId()
  const selectTypologieId = useId()


  return (
    <>
      <button className="fr-btn fr-btn--primary fr-btn--icon-left fr-icon-add-line">Ajouter un membre</button>
      <ul className="fr-tabs fr-tabs__list">
        <li role="presentation">
          <button
            role="tab"
            type="button"
          >
            Membres
          </button>
        </li>
        <li role="presentation">
          <button
            role="tab"
            type="button"
          >
            Suggestions
          </button>
        </li>
        <li role="presentation">
          <button
            role="tab"
            type="button"
          >
            Candidats
          </button>
        </li>
      </ul>
      <span id={labelId}>Filtres : </span>
      <ul className="fr-tags-group">
        <li className="fr-tag fr-tag--sm">
          <select aria-labelledby="labelid"  id={selectRoleId} name="select">
            <option value="" selected disabled hidden>Rôles</option>
            <option value="1">Bénéficiaires</option>
            <option value="2">Co-financeurs</option>
            <option value="3">Observateurs</option>
            <option value="4">Formation</option>
            <option value="4">Co-porteurs</option>
          </select>
        </li>
        <li className="fr-tag fr-tag--sm">
          <select aria-labelledby="labelid"  id={selectTypologieId} name="select">
            <option value="" selected disabled hidden>Typologie</option>
            <option value="1">Préfecture départementale</option>
            <option value="2">Conseils départementaux</option>
            <option value="3">EPCIS</option>
            <option value="4">Associations</option>
            <option value="4">Entreprises privées</option>
          </select>
        </li>
        <li>
          <a href="#" className="fr-tag fr-tag--sm" target="_self">Label tag</a>
        </li>
      </ul>
      <button className="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-download-line">Exporter</button>
      <Liste foo={membres} />
    </>
  )
}
