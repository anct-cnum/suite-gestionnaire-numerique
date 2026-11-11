'use client'

import { ReactElement, useId } from 'react'

import styles from './Legend.module.css'
import { CLASSE_DONNEE_NON_DISPONIBLE, CLASSES_FRAGILITE } from '@/presenters/tableauDeBord/indicesPresenter'

export default function Legend(): ReactElement {
  const idTitre = useId()

  return (
    <div className={`fr-px-2w fr-pb-1w ${styles.legende}`}>
      <p className="fr-text--sm fr-text--bold fr-mb-1v" id={idTitre}>
        Légende : indice de fragilité numérique, sur 10
      </p>
      <ul aria-labelledby={idTitre} className="fr-raw-list fr-grid-row fr-text--sm fr-mb-0">
        {CLASSES_FRAGILITE.map((classe) => (
          <li className={`fr-col-12 fr-col-sm-6 fr-col-md-4 ${styles.classe}`} key={classe.numero}>
            <PastilleFragilite couleur={classe.couleur} />
            <span>
              {classe.tranche} : {classe.libelle}
            </span>
          </li>
        ))}
        <li className={`fr-col-12 fr-col-sm-6 fr-col-md-4 ${styles.classe}`}>
          <PastilleFragilite couleur={CLASSE_DONNEE_NON_DISPONIBLE.couleur} />
          <span>{CLASSE_DONNEE_NON_DISPONIBLE.libelle}</span>
        </li>
      </ul>
    </div>
  )
}

export function PastilleFragilite({ couleur }: Readonly<{ couleur: string }>): ReactElement {
  return <span aria-hidden="true" className={styles.pastille} style={{ backgroundColor: couleur }} />
}
