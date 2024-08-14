import { TypologieRole } from '@/domain/Role'

export interface MesInformationsPersonnellesQuery {
  retrieveMesInformationsPersonnelles: () => Promise<MesInformationsPersonnellesReadModel>
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
  role: TypologieRole
  structureAdresse: string
  structureNumeroDeSiret: string
  structureRaisonSociale: string
  structureTypeDeStructure: string
}>
