import { Prisma } from '@prisma/client'

import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { UtilisateurUid } from '@/domain/Utilisateur'
import { FindGouvernanceRepository } from '@/use-cases/commands/shared/GouvernanceRepository'

export class PrismaGouvernanceRepository implements FindGouvernanceRepository {
  readonly #dataResource: Prisma.GouvernanceRecordDelegate

  constructor(dataResource: Prisma.GouvernanceRecordDelegate) {
    this.#dataResource = dataResource
  }

  async find(uid: GouvernanceUid): Promise<Gouvernance | null> {
    const record = await this.#dataResource.findUnique({
      include: {
        noteDeContexte: {
          include: {
            relationUtilisateur: true,
          },
        },
        relationDepartement: true,
      },
      where: {
        id: Number(uid.state.value),
      },
    })

    if (!record) {
      return null
    }

    const noteDeContexte = record.noteDeContexte ? {
      contenu: record.noteDeContexte.contenu,
      dateDeModification: record.noteDeContexte.derniereEdition,
      uidUtilisateurLAyantModifiee: new UtilisateurUid({
        email: record.noteDeContexte.relationUtilisateur.ssoEmail,
        value: record.noteDeContexte.relationUtilisateur.ssoId,
      }),
    } : undefined

    return Gouvernance.create({
      departement: {
        code: record.relationDepartement.code,
        codeRegion: record.relationDepartement.regionCode,
        nom: record.relationDepartement.nom,
      },
      noteDeContexte,
      uid: String(record.id),
    })
  }
}
