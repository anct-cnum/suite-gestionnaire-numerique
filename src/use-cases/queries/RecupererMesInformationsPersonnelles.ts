export interface MesInformationsPersonnellesLoader {
  findBySsoId: (ssoId: string) => Promise<MesInformationsPersonnellesReadModel>
}

export type MesInformationsPersonnellesReadModel = Readonly<{
  contactEmail: string
  contactFonction: string
  contactNom: string
  contactPrenom: string
  informationsPersonnellesEmail: string
  informationsPersonnellesNom: string
  informationsPersonnellesPrenom: string
  informationsPersonnellesTelephone: string
  role: string
  structureAdresse: string
  structureNumeroDeSiret: string
  structureRaisonSociale: string
  structureTypeDeStructure: string
}>
