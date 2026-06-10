'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

import Information from '../shared/Information/Information'
import Table from '../shared/Table/Table'
import {
  MembreLigneViewModel,
  MembresAConsoliderViewModel,
  RegleViewModel,
} from '@/presenters/membresAConsoliderPresenter'

export default function MembresAConsolider({ regles, viewModel }: Props): ReactElement {
  const regleActive = regles.find((regle) => regle.actif)

  return (
    <section>
      <h1>Membres à consolider</h1>
      <p>
        Chaque règle ci-dessous liste les membres dont le rattachement à une structure mérite d’être corrigé.
        Sélectionnez-en une.
      </p>
      <SelecteurRegles regles={regles} />
      {regleActive === undefined ? null : (
        <>
          <p>{regleActive.sousTitre}</p>
          <ConditionsRegle conditions={regleActive.conditions} />
          {regleActive.disponible ? <ListeMembres viewModel={viewModel} /> : <AVenir />}
        </>
      )}
    </section>
  )
}

function SelecteurRegles({ regles }: Readonly<{ regles: ReadonlyArray<RegleViewModel> }>): ReactElement {
  return (
    <nav
      aria-label="Règle de détection"
      className="fr-mb-3w"
      style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}
    >
      {regles.map((regle) => (
        <Link
          aria-current={regle.actif ? 'page' : undefined}
          className={regle.actif ? 'fr-btn fr-btn--sm' : 'fr-btn fr-btn--sm fr-btn--secondary'}
          href={regle.href}
          key={regle.id}
        >
          {regle.titre}
        </Link>
      ))}
    </nav>
  )
}

function ConditionsRegle({ conditions }: Readonly<{ conditions: ReadonlyArray<string> }>): ReactElement {
  return (
    <>
      <p className="fr-text--sm fr-text--bold fr-mb-1v">Règles de sélection (toutes réunies) :</p>
      <ul className="fr-text--sm fr-mb-2w">
        {conditions.map((condition) => (
          <li className="fr-mb-1v" key={condition}>
            {condition}
          </li>
        ))}
      </ul>
    </>
  )
}

function AVenir(): ReactElement {
  return (
    <div className="fr-p-4w fr-mt-2w" style={{ border: '1px dashed var(--border-default-grey)', textAlign: 'center' }}>
      <p className="fr-badge fr-badge--info fr-badge--no-icon fr-mb-1w">À venir</p>
      <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
        La détection de cette règle n’est pas encore implémentée. La liste des membres concernés s’affichera ici.
      </p>
    </div>
  )
}

function ListeMembres({ viewModel }: Readonly<{ viewModel: MembresAConsoliderViewModel }>): ReactElement {
  const pluriel = viewModel.total > 1 ? 's' : ''
  const resume =
    viewModel.total === 0
      ? 'Aucun membre à consolider détecté pour cette règle.'
      : `${viewModel.total} membre${pluriel} de gouvernance rattaché${pluriel} à une antenne sans activité, alors que l’établissement réel existe ailleurs.`

  return (
    <>
      <p className="fr-text--sm fr-text--bold fr-mb-1v">Lecture des colonnes :</p>
      <ul className="fr-raw-list fr-text--sm fr-text-mention--grey fr-mb-2w">
        <li className="fr-mb-1v">
          <span className="fr-text--bold">Membre (nom d’origine)</span> : nom du membre à l’origine dans FNE.
        </li>
        <li className="fr-mb-1v">
          <span className="fr-text--bold">Nom affiché aujourd’hui</span> : nom de la structure (antenne) à laquelle le
          membre est aujourd’hui rattaché.
        </li>
        <li className="fr-mb-1v">
          <span className="fr-text--bold">Établissement réel proposé</span> : candidat que le système détecte comme
          étant proche.
          <Information>Structure dont le SIRET est identique</Information>
        </li>
      </ul>
      <p className="fr-text--sm fr-text-mention--grey">{resume}</p>

      {viewModel.total > 0 ? (
        <Table
          enTetes={['Membre (nom d’origine)', 'Nom affiché aujourd’hui', 'Établissement réel proposé', '']}
          titre="Membres à consolider"
        >
          {viewModel.membres.map((membre) => (
            <LigneMembre key={membre.membreId} membre={membre} />
          ))}
        </Table>
      ) : null}
    </>
  )
}

function LigneMembre({ membre }: Readonly<{ membre: MembreLigneViewModel }>): ReactElement {
  return (
    <tr>
      <td>
        <span className="fr-text--bold">{membre.nomOrigine}</span>{' '}
        <span className="fr-text--xs fr-text-mention--grey">(dép. {membre.departement})</span>
        {membre.estCoporteur ? (
          <>
            <br />
            <span className="fr-badge fr-badge--no-icon fr-badge--sm fr-badge--green-emeraude">Co-porteur</span>
          </>
        ) : null}
      </td>
      <td>
        <span className="fr-badge fr-badge--no-icon fr-badge--sm fr-badge--warning">{membre.nomActuelAffiche}</span>
      </td>
      <td>
        <span className="fr-text--bold">{membre.saTerrainNom}</span>{' '}
        <span className="fr-text--xs fr-text-mention--grey">
          ({membre.saTerrainOp} rattachement{membre.saTerrainOp > 1 ? 's' : ''} · {membre.nbSaDuSiren} SA pour ce SIREN)
        </span>
      </td>
      <td>
        <Link
          className="fr-btn fr-btn--secondary fr-btn--sm"
          href={`/structures-doublons/comparer?ids=${membre.idsParam}`}
        >
          Comparer / fusionner
        </Link>
      </td>
    </tr>
  )
}

type Props = Readonly<{
  regles: ReadonlyArray<RegleViewModel>
  viewModel: MembresAConsoliderViewModel
}>
