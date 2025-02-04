import { Prisma } from '@prisma/client'

import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { UtilisateurUid } from '@/domain/Utilisateur'
import { GouvernanceRepository } from '@/use-cases/commands/AjouterNoteDeContexteAGouvernance'

export class PrismaGouvernanceRepository implements GouvernanceRepository {
  readonly #gouvernanceDataResource: Prisma.GouvernanceRecordDelegate

  constructor(
    gouvernanceDataResource: Prisma.GouvernanceRecordDelegate
  ) {
    this.#gouvernanceDataResource = gouvernanceDataResource
  }

  async get(uid: GouvernanceUid): Promise<Gouvernance> {
    const record = await this.#gouvernanceDataResource.findUniqueOrThrow({
      include: {
        relationDepartement: true,
        relationEditeurNotePrivee: {
          select: {
            ssoEmail: true,
            ssoId: true,
          },
        },
        relationEditeurNotesDeContexte: {
          select: {
            ssoEmail: true,
            ssoId: true,
          },
        },
      },
      where: {
        departementCode: uid.state.value,
      },
    })

    const notePrivee = record.notePrivee && record.relationEditeurNotePrivee ? {
      contenu: record.notePrivee.contenu,
      dateDeModification: new Date(record.notePrivee.derniereEdition),
      uidEditeur: new UtilisateurUid({
        email: record.relationEditeurNotePrivee.ssoEmail,
        value: record.relationEditeurNotePrivee.ssoId,
      }),
    } : undefined

    const noteDeContexte = Boolean(record.notesDeContexte) &&
      record.relationEditeurNotesDeContexte &&
      record.derniereEditionNoteDeContexte
      ? {
        contenu: record.notesDeContexte ?? '',
        dateDeModification: new Date(record.derniereEditionNoteDeContexte),
        uidEditeur: new UtilisateurUid({
          email: record.relationEditeurNotesDeContexte.ssoEmail,
          value: record.relationEditeurNotesDeContexte.ssoId,
        }),
      }
      : undefined

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
      await this.#gouvernanceDataResource.update({
        data: {
          derniereEditionNoteDeContexte: noteDeContexte.dateDeModification,
          editeurNotesDeContexteId: noteDeContexte.uidEditeur,
          notesDeContexte: noteDeContexte.value,
        },
        where: {
          departementCode: gouvernance.state.uid.value,
        },
      })
    }
  }
}
