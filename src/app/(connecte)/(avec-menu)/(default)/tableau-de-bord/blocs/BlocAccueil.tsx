import { ReactElement } from 'react'

import SelecteurTerritoire from '@/components/transverse/SelecteurTerritoire/SelecteurTerritoire'
import { TerritoireViewModel } from '@/presenters/rechercheTerritoiresPresenter'
import { nomDepartement } from '@/shared/urlHelpers'
import { PerimetreRechercheTerritoires } from '@/use-cases/queries/RechercherTerritoires'
import { Contexte } from '@/use-cases/queries/ResoudreContexte'
import { TerritoireTableauDeBord } from '@/use-cases/queries/shared/TerritoireTableauDeBord'

export default function BlocAccueil({ contexte, perimetre, prenom, territoire }: Props): ReactElement {
  const sousTitre = contexte.estGestionnaireStructureSansCoportage()
    ? "Bienvenue sur votre espace structure de l'inclusion numérique"
    : `Bienvenue sur l'outil de pilotage de l'Inclusion Numérique${suffixTerritoire(territoire)}`

  return (
    <>
      <div className="fr-mb-3w" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1 className="color-blue-france fr-display--xs fr-text--regular fr-mt-5w fr-mb-0">👋 Bonjour {prenom}</h1>
        <div style={{ alignItems: 'flex-start', display: 'flex', gap: '1rem' }}>
          <p
            className="color-blue-france fr-m-0 fr-text--xl fr-text--regular"
            style={{ flex: '1 1 auto', minWidth: 0 }}
          >
            {sousTitre}
          </p>
          {perimetre !== null && (
            <div style={{ flexShrink: 0, marginLeft: 'auto', maxWidth: '100%', width: '24rem' }}>
              <SelecteurTerritoire
                perimetreLimite={perimetre.type !== 'complet'}
                valeurInitiale={valeurInitiale(territoire)}
              />
            </div>
          )}
        </div>
      </div>
      <hr className="fr-hr" />
    </>
  )
}

function suffixTerritoire(territoire: TerritoireTableauDeBord): string {
  if (territoire.type === 'departement') {
    return ` · ${territoire.code}`
  }
  if (territoire.type === 'epci' || territoire.type === 'region') {
    return ` · ${territoire.nom}`
  }
  return ''
}

function valeurInitiale(territoire: TerritoireTableauDeBord): null | TerritoireViewModel {
  if (territoire.type === 'departement') {
    return {
      code: territoire.code,
      label: `${nomDepartement(territoire.code)} · ${territoire.code}`,
      type: 'departement',
      value: `departement-${territoire.code}`,
    }
  }
  if (territoire.type === 'epci' || territoire.type === 'region') {
    return {
      code: territoire.code,
      label: territoire.nom,
      type: territoire.type,
      value: `${territoire.type}-${territoire.code}`,
    }
  }
  return null
}

type Props = Readonly<{
  contexte: Contexte
  perimetre: null | PerimetreRechercheTerritoires
  prenom: string
  territoire: TerritoireTableauDeBord
}>
