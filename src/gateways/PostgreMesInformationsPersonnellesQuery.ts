import { PrismaClient, UtilisateurRecord } from '@prisma/client'

import { toTypologieRole } from './roleMapper'
import { MesInformationsPersonnellesReadModel, MesInformationsPersonnellesQuery } from '@/use-cases/queries/MesInformationsPersonnellesQuery'
import { UtilisateurNonTrouveError } from '@/use-cases/queries/UtilisateurQuery'

export class PostgreMesInformationsPersonnellesQuery implements MesInformationsPersonnellesQuery {
  readonly #prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma
  }

  async findBySub(sub: string): Promise<MesInformationsPersonnellesReadModel> {
    const utilisateurRecord = await this.#prisma.utilisateurRecord.findUnique({
      where: {
        sub,
      },
    })

    if (utilisateurRecord === null) {
      throw new UtilisateurNonTrouveError()
    }

    return transform(utilisateurRecord)
  }
}

function transform(utilisateurRecord: UtilisateurRecord): MesInformationsPersonnellesReadModel {
  return {
    contactEmail: 'manon.verminac@example.com',
    contactFonction: 'Chargée de mission',
    contactNom: 'Verninac',
    contactPrenom: 'Manon',
    informationsPersonnellesEmail: utilisateurRecord.email,
    informationsPersonnellesNom: utilisateurRecord.nom,
    informationsPersonnellesPrenom: utilisateurRecord.prenom,
    informationsPersonnellesTelephone: utilisateurRecord.telephone,
    role: toTypologieRole(utilisateurRecord.role),
    structureAdresse: '201 bis rue de la plaine, 69000 Lyon',
    structureNumeroDeSiret: '62520260000023',
    structureRaisonSociale: 'Préfecture du Rhône',
    structureTypeDeStructure: 'Administration',
  }
}
