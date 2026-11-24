import { PrismaCampagneLoader } from '@/gateways/mesure-impact/PrismaCampagneLoader'
import { RecupererLesCampagnesDeLaStructure } from '@/use-cases/mesure-impact/RecupererLesCampagnesDeLaStructure'

// Une personne agit, pour la mesure d'impact, au nom de sa structure de rattachement (menu, pages et saisie) ;
// sans structure, elle n'a accès à aucune campagne
export function structureDeLaMesureDImpact(utilisateur: Utilisateur): number | undefined {
  return utilisateur.structureId ?? undefined
}

// Le menu « Mesure d'impact » ne s'affiche qu'aux personnes rattachées à une structure qui porte une campagne
export async function structurePorteUneCampagne(utilisateur: Utilisateur): Promise<boolean> {
  const campagnes = await new RecupererLesCampagnesDeLaStructure(new PrismaCampagneLoader()).handle({
    structureId: structureDeLaMesureDImpact(utilisateur),
  })
  return campagnes.length > 0
}

type Utilisateur = Readonly<{
  structureId: null | number
}>
