import { Prisma } from '@prisma/client'

import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { UtilisateurUid } from '@/domain/Utilisateur'
import { GouvernanceRepository } from '@/use-cases/commands/AjouterNoteDeContexteAGouvernance'

export class PrismaGouvernanceRepository implements GouvernanceRepository {
  readonly #noteDeContexteDataResource: Prisma.NoteDeContexteRecordDelegate
  readonly #gouvernanceDataResource: Prisma.GouvernanceRecordDelegate

  constructor(
    gouvernanceDataResource: Prisma.GouvernanceRecordDelegate,
    noteDeContexteDataResource: Prisma.NoteDeContexteRecordDelegate
  ) {
    this.#noteDeContexteDataResource = noteDeContexteDataResource
    this.#gouvernanceDataResource = gouvernanceDataResource
  }

  async get(uid: GouvernanceUid): Promise<Gouvernance> {
    const record = await this.#gouvernanceDataResource.findUniqueOrThrow({
      include: {
        noteDeContexte: {
          include: {
            relationUtilisateur: true,
          },
        },
        relationDepartement: true,
        relationEditeurNotePrivee: true,
      },
      where: {
        departementCode: uid.state.value,
      },
    })

    const noteDeContexte = record.noteDeContexte ? {
      contenu: record.noteDeContexte.contenu,
      dateDeModification: record.noteDeContexte.derniereEdition,
      uidEditeur: new UtilisateurUid({
        email: record.noteDeContexte.relationUtilisateur.ssoEmail,
        value: record.noteDeContexte.relationUtilisateur.ssoId,
      }),
    } : undefined

    const notePrivee = record.notePrivee && record.relationEditeurNotePrivee ? {
      contenu: record.notePrivee.contenu,
      dateDeModification: new Date(record.notePrivee.derniereEdition),
      uidEditeur: new UtilisateurUid({
        email: record.relationEditeurNotePrivee.ssoEmail,
        value: record.relationEditeurNotePrivee.ssoId,
      }),
    } : undefined

    return Gouvernance.create({
      departement: {
        code: record.relationDepartement.code,
        codeRegion: record.relationDepartement.regionCode,
        nom: record.relationDepartement.nom,
      },
      noteDeContexte,
      notePrivee,
      uid: record.departementCode,
    })
  }

  async update(gouvernance: Gouvernance): Promise<void> {
    let notePriveeData
    const notePrivee = gouvernance.state.notePrivee

    if (notePrivee) {
      notePriveeData = {
        editeurNotePriveeId: notePrivee.uidEditeur,
        notePrivee: {
          contenu: notePrivee.value,
          derniereEdition: notePrivee.dateDeModification,
        },
      }
    } else {
      notePriveeData = {
        editeurNotePriveeId: null,
        notePrivee: null,
      }
    }

    await this.#gouvernanceDataResource.update({
      // @ts-expect-error
      data: notePriveeData,
      where: {
        departementCode: gouvernance.state.uid.value,
      },
    })

    const noteDeContexte = gouvernance.state.noteDeContexte
    if (noteDeContexte) {
      await this.#noteDeContexteDataResource.upsert({
        create: {
          contenu: noteDeContexte.value,
          derniereEdition: noteDeContexte.dateDeModification,
          editeurId: noteDeContexte.uidEditeur,
          gouvernanceDepartementCode: gouvernance.state.uid.value,
        },
        update: {
          contenu: noteDeContexte.value,
          derniereEdition: noteDeContexte.dateDeModification,
          editeurId: noteDeContexte.uidEditeur,
        },
        where: {
          gouvernanceDepartementCode: gouvernance.state.uid.value,
        },
      })
    }
  }
}
