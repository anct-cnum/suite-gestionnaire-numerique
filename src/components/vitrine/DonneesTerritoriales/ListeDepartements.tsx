'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

import { ListeDepartementsViewModel } from '@/presenters/listeDepartementsPresenter'

// Alternative à la carte de l’accueil (RGAA 7.3). Même forme que le motif commun aux data-viz
// (#2241, #2251) : un accordéon DSFR fermé sous la carte. Visible aussi en mobile, où la carte est masquée.
export default function ListeDepartements({ groupes }: Props): ReactElement {
  return (
    <section className="fr-accordion">
      <h2 className="fr-accordion__title">
        <button aria-controls="liste-departements" aria-expanded="false" className="fr-accordion__btn" type="button">
          Afficher la liste des départements
        </button>
      </h2>
      <div className="fr-collapse" id="liste-departements">
        <div className="fr-grid-row fr-grid-row--gutters">
          {groupes.map((groupe) => (
            <div className="fr-col-12 fr-col-sm-6 fr-col-lg-3" key={groupe.id}>
              <h3 className="fr-h6 fr-mb-1w" id={groupe.id}>
                {groupe.titre}
              </h3>
              <ul className="fr-raw-list">
                {groupe.departements.map((departement) => (
                  <li className="fr-mb-1v" key={departement.lien}>
                    <Link className="fr-link" href={departement.lien}>
                      {departement.libelle}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

type Props = Readonly<{
  groupes: ListeDepartementsViewModel
}>
