import { ReactElement } from 'react'

import styles from './BlocAccueil.module.css'
import SelecteurGouvernance from '@/components/transverse/SelecteurGouvernance/SelecteurGouvernance'
import { gouvernancesSelecteurPresenteur } from '@/presenters/tableauDeBord/selecteurGouvernancePresenter'
import { Contexte, Scope } from '@/use-cases/queries/ResoudreContexte'

export default function BlocAccueil({ contexte, prenom, scope }: Props): ReactElement {
  const suffixScope = scope.type === 'departement' ? ` · ${scope.code}` : ''
  const sousTitre = contexte.estGestionnaireStructureSansGouvernance()
    ? "Bienvenue sur votre espace structure de l'inclusion numérique"
    : `Bienvenue sur l'outil de pilotage de l'Inclusion Numérique${suffixScope}`
  const options = gouvernancesSelecteurPresenteur(contexte)
  let selectedValue = scope.type === 'departement' ? scope.code : undefined
  if (selectedValue === undefined) {
    if (contexte.estNational()) {
      selectedValue = 'France'
    } else if (contexte.aCesRoles('gestionnaire_departement')) {
      const depScope = contexte.scopes.find((scope) => scope.type === 'departement')
      if (depScope !== undefined && 'code' in depScope) {
        selectedValue = depScope.code
      }
    }
  }

  return (
    <>
      <div className="fr-mb-3w" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1 className={`color-blue-france fr-mt-5w fr-mb-0 ${styles.titre}`}>👋 Bonjour {prenom}</h1>
        <div style={{ alignItems: 'flex-end', display: 'flex', gap: '2rem' }}>
          <p className={`color-blue-france fr-m-0 ${styles.sousTitre}`} style={{ flex: '1 0 0' }}>
            {sousTitre}
          </p>
          {options.length >= 2 && (
            <div style={{ flexShrink: 0 }}>
              <SelecteurGouvernance options={options} selectedValue={selectedValue} />
            </div>
          )}
        </div>
      </div>
      <hr className="fr-hr" />
    </>
  )
}

type Props = Readonly<{
  contexte: Contexte
  prenom: string
  scope: Scope
}>
