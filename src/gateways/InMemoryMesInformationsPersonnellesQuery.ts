import { TypologieRole } from '@/domain/Role'
import { MesInformationsPersonnellesReadModel, MesInformationsPersonnellesQuery } from '@/use-cases/queries/MesInformationsPersonnellesQuery'

export class InMemoryMesInformationsPersonnellesQuery implements MesInformationsPersonnellesQuery {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async retrieveMesInformationsPersonnelles(): Promise<MesInformationsPersonnellesReadModel> {
    return Promise.resolve({
      contactEmail: 'manon.verminac@example.com',
      contactFonction: 'Chargée de mission',
      contactNom: 'Verninac',
      contactPrenom: 'Manon',
      informationsPersonnellesEmail: 'julien.deschamps@example.com',
      informationsPersonnellesNom: 'Deschamps',
      informationsPersonnellesPrenom: 'Julien',
      informationsPersonnellesTelephone: '04 05 06 07 08',
      role: 'Gestionnaire structure' as TypologieRole,
      structureAdresse: '201 bis rue de la plaine, 69000 Lyon',
      structureNumeroDeSiret: '62520260000023',
      structureRaisonSociale: 'Préfecture du Rhône',
      structureTypeDeStructure: 'Administration',
    })
  }
}
