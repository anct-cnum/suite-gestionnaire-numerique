'use client'

import Link from 'next/link'
import { ReactElement, useContext, useState, useTransition } from 'react'

import { clientContext } from '../shared/ClientContext'
import { Notification } from '../shared/Notification/Notification'
import Pagination from '../shared/Pagination/Pagination'
import SpinnerSimple from '../shared/Spinner/SpinnerSimple'
import Table from '../shared/Table/Table'
import { AppariementLieuViewModel, AppariementsLieuxViewModel } from '@/presenters/appariementsLieuxPresenter'
import { DecisionAppariementLieu } from '@/use-cases/commands/DeciderAppariementLieu'
import { StatutAppariement } from '@/use-cases/queries/RechercherAppariementsLieux'

export default function AppariementsLieux({ viewModel }: Props): ReactElement {
  const { deciderAppariementLieuAction, pathname, router, utilisateursParPage } = useContext(clientContext)
  const [isPending, startTransition] = useTransition()
  // Clé de la paire dont la décision est en cours d'enregistrement (désactive ses boutons).
  const [cleEnCours, setCleEnCours] = useState<null | string>(null)

  const estFileDeRevue = viewModel.statut === 'a_valider'
  const resume = resumer(viewModel.statut, viewModel.total)

  function naviguer(url: string): void {
    startTransition(() => {
      router.push(url)
    })
  }

  function changerStatut(statut: StatutAppariement): void {
    naviguer(`/appariements-lieux?statut=${statut}`)
  }

  async function decider(appariement: AppariementLieuViewModel, decision: DecisionAppariementLieu): Promise<void> {
    setCleEnCours(appariement.cle)
    const messages = await deciderAppariementLieuAction({
      cartoRecordId: appariement.carto.recordId,
      decision,
      lieuId: appariement.lieu.id,
      path: pathname,
    })
    setCleEnCours(null)
    if (messages.includes('OK')) {
      Notification('success', { description: decision === 'valide' ? 'validé' : 'rejeté', title: 'Appariement ' })
      // Le serveur a revalidé le chemin : on rafraîchit en place pour retirer la paire de la file.
      router.refresh()
    } else {
      Notification('error', { description: messages.join(' · '), title: 'Erreur : ' })
    }
  }

  return (
    <section>
      <h1>Appariements de lieux</h1>
      <p className="fr-text--sm fr-text-mention--grey">
        Rapprochements entre les lieux du fichier national de la cartographie (dora, RhinOcc, France Services…) et les
        lieux de la Coop médiation numérique, détectés par similarité de nom, d’adresse et de distance. Valider une
        paire confirme qu’il s’agit du même lieu ; la fusion effective est réalisée ensuite par l’Entrepôt de données.
      </p>

      <ul className="fr-tags-group fr-mb-2w">
        {viewModel.onglets.map((onglet) => (
          <li key={onglet.statut}>
            <button
              aria-pressed={onglet.estActif}
              className="fr-tag"
              onClick={() => {
                changerStatut(onglet.statut)
              }}
              type="button"
            >
              {onglet.label} ({onglet.nombre})
            </button>
          </li>
        ))}
      </ul>

      {isPending ? (
        <SpinnerSimple text="Chargement des appariements…" />
      ) : (
        <>
          <p className="fr-text--sm fr-text-mention--grey">{resume}</p>

          {viewModel.total > 0 ? (
            <Table
              enTetes={[
                'Record cartographie',
                'Lieu coop',
                'Score',
                'Distance',
                estFileDeRevue ? 'Décision' : 'Décidé',
              ]}
              multiline={true}
              titre="Appariements de lieux"
            >
              {viewModel.appariements.map((appariement) => (
                <LigneAppariement
                  appariement={appariement}
                  estEnCours={cleEnCours === appariement.cle}
                  key={appariement.cle}
                  onDecision={(decision) => {
                    void decider(appariement, decision)
                  }}
                />
              ))}
            </Table>
          ) : null}

          {viewModel.total > utilisateursParPage ? (
            <div className="fr-grid-row fr-grid-row--center fr-mt-3w">
              <Pagination onNavigation={naviguer} pathname="/appariements-lieux" totalUtilisateurs={viewModel.total} />
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}

function LigneAppariement({ appariement, estEnCours, onDecision }: PropsLigne): ReactElement {
  const { carto, lieu, scores } = appariement

  return (
    <tr>
      <td style={{ width: '40%' }}>
        <span className="fr-text--bold">{carto.nom}</span>
        <br />
        <span className="fr-text--xs fr-text-mention--grey">{carto.adresse}</span>
        <br />
        <span className="fr-badge fr-badge--no-icon fr-badge--sm" title={carto.segments}>
          {carto.source}
        </span>
      </td>
      <td style={{ width: '40%' }}>
        <Link className="fr-text--bold" href={`/lieu/${lieu.id}`}>
          {lieu.nom}
        </Link>
        <br />
        <span className="fr-text--xs fr-text-mention--grey">{lieu.adresse}</span>
      </td>
      <td>
        <span className="fr-text--bold">{scores.global}</span>
        <br />
        <span className="fr-text--xs fr-text-mention--grey" style={{ whiteSpace: 'nowrap' }}>
          nom {scores.nom} · adresse {scores.adresse} · distance {scores.distance}
        </span>
      </td>
      <td style={{ whiteSpace: 'nowrap' }}>{appariement.distance}</td>
      <td>
        {appariement.statut === 'a_valider' ? (
          <div className="fr-btns-group fr-btns-group--sm fr-btns-group--inline">
            <button
              className="fr-btn fr-btn--sm"
              disabled={estEnCours}
              onClick={() => {
                onDecision('valide')
              }}
              type="button"
            >
              Valider
            </button>
            <button
              className="fr-btn fr-btn--secondary fr-btn--sm"
              disabled={estEnCours}
              onClick={() => {
                onDecision('rejete')
              }}
              type="button"
            >
              Rejeter
            </button>
          </div>
        ) : (
          <Decision appariement={appariement} />
        )}
      </td>
    </tr>
  )
}

function Decision({ appariement }: Readonly<{ appariement: AppariementLieuViewModel }>): ReactElement {
  const estValide = appariement.statut === 'valide'

  return (
    <>
      <span
        className={`fr-badge fr-badge--no-icon fr-badge--sm ${estValide ? 'fr-badge--success' : 'fr-badge--error'}`}
      >
        {estValide ? 'Validé' : 'Rejeté'}
      </span>
      {appariement.decision === null ? null : (
        <>
          <br />
          <span className="fr-text--xs fr-text-mention--grey">
            le {appariement.decision.le} par {appariement.decision.par}
          </span>
        </>
      )}
    </>
  )
}

function resumer(statut: StatutAppariement, total: number): string {
  const pluriel = total > 1 ? 's' : ''
  if (statut === 'a_valider') {
    return `${total} paire${pluriel} à arbitrer, triée${pluriel} par score décroissant.`
  }
  const participe = statut === 'valide' ? 'validée' : 'rejetée'

  return `${total} paire${pluriel} ${participe}${pluriel}.`
}

type PropsLigne = Readonly<{
  appariement: AppariementLieuViewModel
  estEnCours: boolean
  onDecision(decision: DecisionAppariementLieu): void
}>

type Props = Readonly<{
  viewModel: AppariementsLieuxViewModel
}>
