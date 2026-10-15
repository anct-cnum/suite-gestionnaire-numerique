import { ReactElement } from 'react'

import styles from './LieuInclusionDetailsDejaEnregistre.module.css'

// Bandeau d'accueil de la maquette V6-3 : affiché quand l'utilisateur arrive depuis
// « C'est mon lieu », dans l'encart des lieux déjà déclarés à une adresse (#1495).
export default function LieuInclusionDetailsDejaEnregistre(): ReactElement {
  return (
    <div className="fr-grid-row fr-grid-row--middle background-info fr-px-3w fr-py-2w fr-mb-3w" role="status">
      <div className="fr-col-auto fr-mr-2w">
        <span aria-hidden="true" className={`fr-icon-information-fill ${styles.icone}`} />
      </div>
      <div className="fr-col">
        <p className="fr-h6 fr-mb-1v">Ce lieu est déjà enregistré</p>
        <p className="fr-mb-0">
          Vous n’avez pas besoin de le créer. Vérifiez ses informations et modifiez-les si elles ne sont plus à jour.
        </p>
      </div>
    </div>
  )
}
