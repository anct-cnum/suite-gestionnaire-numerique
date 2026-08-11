export interface StructureLabelLoader {
  get(structureId: number): Promise<StructureLabelReadModel>
}

export type StructureLabelReadModel = Readonly<{
  contacts: ReadonlyArray<
    Readonly<{
      email: string
      estReferentFNE: boolean
      fonction: string
      id: number
      nom: string
      prenom: string
      telephone: string
    }>
  >
  identite: Readonly<{
    adresse: string
    departement: string
    nom: string
    region: string
    siret: string
    typologie: string
  }>
  structureId: number
}>
