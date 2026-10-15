import Link from 'next/link'
import { ReactElement } from 'react'

import styles from './LieuxDejaDeclares.module.css'
import { LieuInclusionSimilaireViewModel } from '@/presenters/lieuxInclusionSimilairesPresenter'

// Contrôle non bloquant sous le champ adresse (maquettes V6) : les lieux déjà
// déclarés à l'adresse saisie sont présentés pour que l'humain tranche, jamais pour
// empêcher la saisie. « C'est mon lieu » mène à la fiche du lieu existant (V6-3).
export default function LieuxDejaDeclares({ consigne, lieux }: Props): ReactElement {
  return (
    <div className={`fr-py-2w fr-pl-5v fr-pr-2w ${styles.encart}`}>
      <p className="fr-text--bold fr-mb-1v">
        {lieux.length === 1
          ? '1 lieu est déjà déclaré à cette adresse'
          : `${lieux.length} lieux sont déjà déclarés à cette adresse`}
      </p>
      <p className="fr-text--sm color-grey fr-mb-0">{consigne}</p>

      <ul className="fr-raw-list">
        {lieux.map((lieu) => (
          <li className="fr-mt-2w" key={lieu.href}>
            <div className={`fr-grid-row fr-grid-row--top fr-px-4w fr-py-3w grey-border border-radius ${styles.carte}`}>
              <div className="fr-col">
                <p className="fr-text--bold fr-mb-0">{lieu.nom}</p>
                <p className="fr-text--sm fr-mb-0">
                  <span className="color-grey">{`${lieu.typologies} · `}</span>
                  <span className="fr-text--bold">{lieu.adresse}</span>
                </p>
                <p className="fr-text--sm color-grey fr-mb-0">
                  {`${lieu.libelleSiret} · ${lieu.libellePersonnesRattachees}`}
                </p>
              </div>
              <div className="fr-col-auto fr-pl-2w">
                <Link className="fr-btn fr-btn--secondary fr-btn--sm" href={lieu.href}>
                  C’est mon lieu
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

type Props = Readonly<{
  consigne: string
  lieux: ReadonlyArray<LieuInclusionSimilaireViewModel>
}>
