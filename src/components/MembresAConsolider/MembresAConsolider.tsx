'use client'

import Link from 'next/link'
import { ReactElement, useContext, useId, useState } from 'react'

import Information from '../shared/Information/Information'
import ConfirmationModal from '../shared/Modal/ConfirmationModal'
import { Notification } from '../shared/Notification/Notification'
import Table from '../shared/Table/Table'
import { clientContext } from '@/components/shared/ClientContext'
import {
  ImportCsvResultViewModel,
  MembreCsvLigneViewModel,
  MembreLigneViewModel,
  MembresAConsoliderViewModel,
  parserCsvMembresAConsolider,
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
      <ImportCsv />
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
        <div className="fr-btns-group fr-btns-group--sm fr-btns-group--inline">
          <BoutonTransfererMembre
            idCibleProposee={membre.idCible}
            idMembre={membre.membreId}
            idSource={membre.idSource}
            nomActuel={membre.nomActuelAffiche}
            nomOrigine={membre.nomOrigine}
          />
          <Link
            className="fr-btn fr-btn--secondary fr-btn--sm"
            href={`/structures-doublons/comparer?ids=${membre.idsParam}`}
          >
            Comparer
          </Link>
        </div>
      </td>
    </tr>
  )
}

// Bouton + modale de transfert d'un membre, réutilisé par la liste détectée et par l'import CSV.
function BoutonTransfererMembre({
  idCibleProposee,
  idMembre,
  idSource,
  nomActuel,
  nomOrigine,
}: BoutonTransfererProps): ReactElement {
  const { pathname, router, transfererMembreAction } = useContext(clientContext)
  const [estModaleOuverte, setEstModaleOuverte] = useState(false)
  const [idCible, setIdCible] = useState(String(idCibleProposee))
  const [enCours, setEnCours] = useState(false)
  const modaleId = useId()
  const idCibleChampId = useId()

  async function confirmerTransfert(): Promise<void> {
    const cible = Number(idCible)
    if (!Number.isInteger(cible) || cible <= 0) {
      Notification('error', { description: 'Identifiant de structure cible invalide', title: 'Erreur : ' })
      return
    }
    setEnCours(true)
    const messages = await transfererMembreAction({ idCible: cible, idMembre, idSource, path: pathname })
    setEnCours(false)
    setEstModaleOuverte(false)

    if (messages.includes('OK')) {
      Notification('success', { description: 'transféré', title: 'Membre ' })
      router.refresh()
    } else {
      Notification('error', { description: messages.join(', '), title: 'Erreur : ' })
    }
  }

  return (
    <>
      <button
        className="fr-btn fr-btn--sm"
        onClick={() => {
          setEstModaleOuverte(true)
        }}
        type="button"
      >
        Transférer
      </button>
      <ConfirmationModal
        confirmLabel={enCours ? 'Transfert…' : 'Transférer le membre'}
        id={modaleId}
        isOpen={estModaleOuverte}
        onCancel={() => {
          setEstModaleOuverte(false)
        }}
        onConfirm={confirmerTransfert}
        title="Transférer le membre vers une autre structure"
      >
        <p className="fr-text--sm">
          Le membre <span className="fr-text--bold">{nomOrigine}</span>, ses utilisateurs et ses contacts seront
          re-rattachés de la structure #{idSource} ({nomActuel}) vers la structure cible ci-dessous. La structure
          d’origine n’est pas supprimée.
        </p>
        <div className="fr-input-group">
          <label className="fr-label" htmlFor={idCibleChampId}>
            Identifiant de la structure cible
          </label>
          <input
            className="fr-input"
            id={idCibleChampId}
            min={1}
            onChange={(event) => {
              setIdCible(event.target.value)
            }}
            type="number"
            value={idCible}
          />
        </div>
      </ConfirmationModal>
    </>
  )
}

function ImportCsv(): ReactElement {
  const [texte, setTexte] = useState('')
  const [resultat, setResultat] = useState<ImportCsvResultViewModel | undefined>(undefined)
  const texteId = useId()

  return (
    <details className="fr-mt-4w">
      <summary className="fr-text--bold">Importer une liste depuis un CSV</summary>
      <p className="fr-text--sm fr-text-mention--grey fr-mt-1w">
        Collez un CSV de triage avec les en-têtes <code>membre_id</code>, <code>cur_id</code> (structure source) et{' '}
        <code>alt_id</code> (structure cible). Séparateur tabulation, point-virgule ou virgule.
      </p>
      <div className="fr-input-group">
        <label className="fr-label" htmlFor={texteId}>
          Contenu du CSV
        </label>
        <textarea
          className="fr-input"
          id={texteId}
          onChange={(event) => {
            setTexte(event.target.value)
          }}
          rows={6}
          value={texte}
        />
      </div>
      <button
        className="fr-btn fr-btn--sm fr-mb-2w"
        onClick={() => {
          setResultat(parserCsvMembresAConsolider(texte))
        }}
        type="button"
      >
        Charger la liste
      </button>
      {resultat === undefined ? null : <ResultatCsv resultat={resultat} />}
    </details>
  )
}

function ResultatCsv({ resultat }: Readonly<{ resultat: ImportCsvResultViewModel }>): ReactElement {
  return (
    <>
      {resultat.erreurs.length > 0 ? (
        <ul className="fr-text--sm fr-mb-2w" style={{ color: 'var(--text-default-error)' }}>
          {resultat.erreurs.map((erreur) => (
            <li key={erreur}>{erreur}</li>
          ))}
        </ul>
      ) : null}
      {resultat.lignes.length > 0 ? (
        <Table enTetes={['Membre', 'Structure source', 'Structure cible', '']} titre="Membres importés du CSV">
          {resultat.lignes.map((ligne) => (
            <LigneCsv key={`${ligne.idMembre}-${ligne.idSource}-${ligne.idCible}`} ligne={ligne} />
          ))}
        </Table>
      ) : (
        <p className="fr-text--sm fr-text-mention--grey">Aucune ligne exploitable.</p>
      )}
    </>
  )
}

function LigneCsv({ ligne }: Readonly<{ ligne: MembreCsvLigneViewModel }>): ReactElement {
  return (
    <tr>
      <td>
        <span className="fr-text--bold">{ligne.nomOrigine}</span>
      </td>
      <td>#{ligne.idSource}</td>
      <td>#{ligne.idCible}</td>
      <td>
        <BoutonTransfererMembre
          idCibleProposee={ligne.idCible}
          idMembre={ligne.idMembre}
          idSource={ligne.idSource}
          nomActuel={ligne.nomActuel}
          nomOrigine={ligne.nomOrigine}
        />
      </td>
    </tr>
  )
}

type BoutonTransfererProps = Readonly<{
  idCibleProposee: number
  idMembre: string
  idSource: number
  nomActuel: string
  nomOrigine: string
}>

type Props = Readonly<{
  regles: ReadonlyArray<RegleViewModel>
  viewModel: MembresAConsoliderViewModel
}>
