export interface UneGouvernanceReadModelLoader {
  find: (codeDepartement: string) => Promise<UneGouvernanceReadModel | null>
}

export type UneGouvernanceReadModel = Readonly<{
  nom: string
}>
