import { PrismaCampagneLoader } from '@/gateways/mesure-impact/PrismaCampagneLoader'
import { RecupererLesCampagnesDeLaStructure } from '@/use-cases/mesure-impact/RecupererLesCampagnesDeLaStructure'

// Pendant le pilote, la mesure d'impact est réservée aux bêta-testeurs : une autre personne n'agit pour aucune
// structure, donc n'a accès à aucune campagne (menu, pages et saisie)
export function structureDeLaMesureDImpact(utilisateur: Utilisateur): number | undefined {
  return utilisateur.isBetaTesteur ? (utilisateur.structureId ?? undefined) : undefined
}

// Le menu « Mesure d'impact » ne s'affiche qu'aux personnes rattachées à une structure qui porte une campagne
export async function structurePorteUneCampagne(utilisateur: Utilisateur): Promise<boolean> {
  const campagnes = await new RecupererLesCampagnesDeLaStructure(new PrismaCampagneLoader()).handle({
    structureId: structureDeLaMesureDImpact(utilisateur),
  })
  return campagnes.length > 0
}

type Utilisateur = Readonly<{
  isBetaTesteur: boolean
  structureId: null | number
}>
