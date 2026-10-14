export type GouvernanceStructureReadModel = ReadonlyMap<number, UneGouvernanceStructureReadModel>

export interface GouvernanceStructureLoader {
  recupererGouvernanceDesStructures(structureIds: ReadonlyArray<number>): Promise<GouvernanceStructureReadModel>
}

export type UneGouvernanceStructureReadModel = Readonly<{
  roleGouvernance: 'coporteur' | 'membre'
  siret: string
  statutStructure: 'candidate' | 'validée'
  territoires: ReadonlyArray<string>
}>
