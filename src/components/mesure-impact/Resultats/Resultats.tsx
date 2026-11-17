'use client'

import { ReactElement, ReactNode, useId } from 'react'

import Select from '@/components/shared/Select/Select'
import { QuestionViewModel, ResultatsViewModel } from '@/presenters/mesure-impact/resultatsPresenter'

// Résultats de la campagne (maquette 08c). Les filtres rechargent la page : le calcul se fait côté serveur.
// Le changement d'onglet est géré par le JS du DSFR, comme pour tout onglet canonique.
export default function Resultats({ viewModel }: Props): ReactElement {
  const { chiffresCles, filtres, introduction, onglets, titre, total } = viewModel
  const idFormulaire = useId()

  return (
    <>
      <h1 className="fr-h2">{titre}</h1>
      <p>
        {introduction} Les pourcentages sont calculés sur les répondants à chaque question. Les résultats se mettent à
        jour à chaque nouvelle réponse.
      </p>
      <form aria-labelledby={idFormulaire} className="fr-mb-4w" method="get">
        <h2 className="fr-sr-only" id={idFormulaire}>
          Filtrer les résultats
        </h2>
        <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--bottom">
          <div className="fr-col-12 fr-col-md-4">
            <Filtre filtre={filtres.codePostal} id="filtre-code-postal" nom="codePostal">
              Territoire
              <span className="fr-hint-text">Tout le territoire ou un code postal</span>
            </Filtre>
          </div>
          <div className="fr-col-12 fr-col-md-4">
            <Filtre filtre={filtres.mois} id="filtre-mois" nom="mois">
              Période
              <span className="fr-hint-text">Ou un mois de la campagne</span>
            </Filtre>
          </div>
          <div className="fr-col-12 fr-col-md-4">
            <Filtre filtre={filtres.canal} id="filtre-canal" nom="canal">
              Canal de réponse
              <span className="fr-hint-text">En ligne, sur papier ou par téléphone</span>
            </Filtre>
          </div>
        </div>
        <button className="fr-btn fr-btn--secondary" type="submit">
          Afficher les résultats
        </button>
      </form>
      <h2 className="fr-h4">{total}</h2>
      <ul aria-label="Chiffres clés" className="fr-grid-row fr-grid-row--gutters fr-raw-list fr-mb-4w">
        {chiffresCles.map(({ libelle, valeur }) => (
          <li className="fr-col-12 fr-col-md-4" key={libelle}>
            <div className="fr-background-alt--pink-macaron fr-p-3w">
              <p className="fr-h3 fr-text-title--blue-france fr-mb-1w">{valeur}</p>
              <p className="fr-mb-0">{libelle}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="fr-tabs">
        <ul aria-label="Résultats par partie du questionnaire" className="fr-tabs__list" role="tablist">
          {onglets.map((onglet, index) => (
            <li key={onglet.id} role="presentation">
              <button
                aria-controls={`resultats-panneau-${onglet.id}`}
                aria-selected={index === 0}
                className="fr-tabs__tab"
                id={`resultats-onglet-${onglet.id}`}
                role="tab"
                tabIndex={index === 0 ? 0 : -1}
                type="button"
              >
                {onglet.libelle}
              </button>
            </li>
          ))}
        </ul>
        {onglets.map((onglet, index) => (
          <div
            aria-labelledby={`resultats-onglet-${onglet.id}`}
            className={`fr-tabs__panel${index === 0 ? ' fr-tabs__panel--selected' : ''}`}
            id={`resultats-panneau-${onglet.id}`}
            key={onglet.id}
            role="tabpanel"
            tabIndex={0}
          >
            {onglet.questions.map((question) => (
              <ResultatDeLaQuestion key={question.cle} question={question} />
            ))}
          </div>
        ))}
      </div>
    </>
  )
}

function Filtre({ children, filtre, id, nom }: FiltreProps): ReactElement {
  return (
    <Select
      id={id}
      name={nom}
      options={filtre.options.map((option) => ({ ...option, isSelected: option.value === filtre.valeur }))}
    >
      {children}
    </Select>
  )
}

function ResultatDeLaQuestion({ question }: Readonly<{ question: QuestionViewModel }>): ReactElement {
  const idTitre = useId()
  return (
    <section aria-labelledby={idTitre} className="fr-mb-6w">
      <p className="fr-text--sm fr-text-mention--grey fr-mb-1w">{question.surtitre}</p>
      <h3 className="fr-h6" id={idTitre}>
        {question.titre}
      </h3>
      <Restitution question={question} />
      <p className="fr-text--xs fr-text-mention--grey fr-mt-2w fr-mb-0">{question.base}</p>
    </section>
  )
}

function Restitution({ question }: Readonly<{ question: QuestionViewModel }>): ReactElement {
  switch (question.type) {
    case 'avant-apres':
      return (
        <Tableau
          colonnes={['Niveau', 'Avant', 'Après', 'Différentiel']}
          lignes={question.niveaux.map(({ apres, avant, differentiel, libelle }) => [
            libelle,
            avant,
            apres,
            differentiel,
          ])}
          titre={question.titre}
        />
      )
    case 'grille':
      return (
        <Tableau
          colonnes={['Équipement', ...question.colonnes, 'Base']}
          lignes={question.lignes.map(({ base, libelle, parts }) => [libelle, ...parts, base])}
          titre={question.titre}
        />
      )
    case 'repartition':
      return (
        <ul className="fr-raw-list">
          {question.lignes.map(({ libelle, part, pourcentage }) => (
            <li className="fr-grid-row fr-grid-row--middle fr-mb-1w" key={libelle}>
              <span className="fr-col-12 fr-col-md-6 fr-text--sm fr-mb-0 fr-pr-md-2w">{libelle}</span>
              <span aria-hidden="true" className="fr-col-10 fr-col-md-5 fr-background-contrast--grey">
                <span
                  className="fr-background-action-high--blue-france"
                  style={{ display: 'block', height: '0.75rem', width: `${pourcentage}%` }}
                />
              </span>
              <span className="fr-col-2 fr-col-md-1 fr-text--sm fr-text--bold fr-mb-0 fr-pl-1w">{part}</span>
            </li>
          ))}
        </ul>
      )
  }
}

function Tableau({ colonnes, lignes, titre }: TableauProps): ReactElement {
  return (
    <div className="fr-table fr-table--sm fr-mb-0">
      <div className="fr-table__wrapper">
        <div className="fr-table__container">
          <div className="fr-table__content">
            <table>
              <caption className="fr-sr-only">{titre}</caption>
              <thead>
                <tr>
                  {colonnes.map((colonne) => (
                    <th key={colonne} scope="col">
                      {colonne}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lignes.map(([entete, ...cellules]) => (
                  <tr key={entete}>
                    <th scope="row">{entete}</th>
                    {cellules.map((cellule, index) => (
                      <td key={colonnes[index + 1]}>{cellule}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

type Props = Readonly<{
  viewModel: ResultatsViewModel
}>

type FiltreProps = Readonly<{
  children: ReactNode
  filtre: ResultatsViewModel['filtres']['canal']
  id: string
  nom: string
}>

type TableauProps = Readonly<{
  colonnes: ReadonlyArray<string>
  lignes: ReadonlyArray<ReadonlyArray<string>>
  titre: string
}>
