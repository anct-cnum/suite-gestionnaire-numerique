'use client'

import { ReactElement, useState } from 'react'

import { PastilleFragilite } from '@/components/shared/Carte/Legend'
import { nombreDePage, pages } from '@/presenters/paginationPresenter'
import {
  CLASSE_DONNEE_NON_DISPONIBLE,
  LigneTableauFragilite,
  syntheseFragilite,
  trierLignesFragilite,
  TriFragilite,
} from '@/presenters/tableauDeBord/indicesPresenter'

const LIGNES_PAR_PAGE = 20

export default function TableauFragilite({ lignes, nomColonneTerritoire, titre }: Props): ReactElement {
  const [tri, setTri] = useState<TriFragilite>({ colonne: 'territoire', sens: 'ascending' })
  const [page, setPage] = useState(1)

  const territoire = nomColonneTerritoire.toLocaleLowerCase('fr-FR')
  const nombreDePages = nombreDePage(lignes.length, LIGNES_PAR_PAGE)
  const lignesAffichees = trierLignesFragilite(lignes, tri).slice((page - 1) * LIGNES_PAR_PAGE, page * LIGNES_PAR_PAGE)

  function trierPar(colonne: TriFragilite['colonne']): void {
    setTri((precedent) => ({
      colonne,
      sens: precedent.colonne === colonne && precedent.sens === 'ascending' ? 'descending' : 'ascending',
    }))
    setPage(1)
  }

  function enTeteTriable(colonne: TriFragilite['colonne'], libelle: string, libelleTri: string): ReactElement {
    const actif = tri.colonne === colonne
    let classeTri = 'fr-btn--sort'
    if (actif) {
      classeTri = tri.sens === 'ascending' ? 'fr-btn--sort-asc' : 'fr-btn--sort-desc'
    }
    return (
      <th aria-sort={actif ? tri.sens : undefined} scope="col">
        <div className="fr-cell--sort">
          {libelle}
          <button
            className={`fr-btn fr-btn--sm ${classeTri}`}
            onClick={() => {
              trierPar(colonne)
            }}
            type="button"
          >
            {libelleTri}
          </button>
        </div>
      </th>
    )
  }

  function lienDePagination(numero: number, libelle: string, classe: string, desactive: boolean): ReactElement {
    return (
      <li>
        <button
          className={`fr-pagination__link ${classe}`}
          disabled={desactive}
          onClick={() => {
            setPage(numero)
          }}
          type="button"
        >
          {libelle}
        </button>
      </li>
    )
  }

  return (
    <>
      <p className="fr-text--sm fr-mb-1w fr-px-2w fr-px-md-0">
        {syntheseFragilite(lignes, { pluriel: `${territoire}s`, singulier: territoire })}
      </p>
      <div className="fr-table fr-table--sm fr-table--multiline fr-mb-0">
        <div className="fr-table__wrapper">
          <div className="fr-table__container">
            <div className="fr-table__content">
              <table>
                <caption>{titre}</caption>
                <thead>
                  <tr>
                    {enTeteTriable('territoire', nomColonneTerritoire, `Trier par ${territoire}`)}
                    {enTeteTriable('indice', 'Indice (sur 10)', 'Trier par indice')}
                    <th scope="col">Classe</th>
                  </tr>
                </thead>
                <tbody>
                  {lignesAffichees.map((ligne) => (
                    <tr key={ligne.code}>
                      <th scope="row">{ligne.territoire}</th>
                      <td>{ligne.indiceAffiche}</td>
                      <td>
                        <PastilleFragilite couleur={ligne.classe.couleur} />{' '}
                        {ligne.classe === CLASSE_DONNEE_NON_DISPONIBLE ? 'non disponible' : ligne.classe.libelle}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {nombreDePages > 1 ? (
        <nav aria-label={`Pagination du tableau : ${titre}`} className="fr-pagination fr-mt-2w fr-px-2w fr-px-md-0">
          <ul className="fr-pagination__list">
            {lienDePagination(1, 'Première page', 'fr-pagination__link--first', page === 1)}
            {lienDePagination(
              page - 1,
              'Page précédente',
              'fr-pagination__link--prev fr-pagination__link--lg-label',
              page === 1
            )}
            {pages(lignes.length, page, LIGNES_PAR_PAGE).map((numero) => (
              <li key={numero}>
                <button
                  aria-current={numero === page ? 'page' : undefined}
                  className="fr-pagination__link"
                  onClick={() => {
                    setPage(numero)
                  }}
                  title={`Page ${numero}`}
                  type="button"
                >
                  {numero}
                </button>
              </li>
            ))}
            {lienDePagination(
              page + 1,
              'Page suivante',
              'fr-pagination__link--next fr-pagination__link--lg-label',
              page === nombreDePages
            )}
            {lienDePagination(nombreDePages, 'Dernière page', 'fr-pagination__link--last', page === nombreDePages)}
          </ul>
        </nav>
      ) : null}
    </>
  )
}

type Props = Readonly<{
  lignes: ReadonlyArray<LigneTableauFragilite>
  nomColonneTerritoire: string
  titre: string
}>
