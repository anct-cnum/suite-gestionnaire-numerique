import { QueryHandler } from '../QueryHandler'
import { Campagne } from '@/domain/mesure-impact/Campagne'

// Campagnes que pilotent les personnes rattachées à une structure : elles ouvrent l'espace Mesure d'impact
export class RecupererLesCampagnesDeLaStructure implements QueryHandler<Query, ReadonlyArray<CampagneDeLaStructure>> {
  readonly #loader: CampagnesDeLaStructureLoader

  constructor(loader: CampagnesDeLaStructureLoader) {
    this.#loader = loader
  }

  async handle({ structureId }: Query): Promise<ReadonlyArray<CampagneDeLaStructure>> {
    if (structureId === undefined) {
      return []
    }
    const campagnes = await this.#loader.deLaStructure(structureId)
    return campagnes.map((campagne) => {
      const { identifiantPublic, libelleTerritoire, nom } = campagne.state
      return { identifiantPublic, libelleTerritoire, nom }
    })
  }
}

export interface CampagnesDeLaStructureLoader {
  deLaStructure(structureId: number): Promise<ReadonlyArray<Campagne>>
}

type CampagneDeLaStructure = Readonly<{
  identifiantPublic: string
  libelleTerritoire: string
  nom: string
}>

type Query = Readonly<{
  // Absente pour une personne sans structure
  structureId?: number
}>
