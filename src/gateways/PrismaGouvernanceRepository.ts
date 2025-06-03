import prisma from '../../prisma/prismaClient'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { UtilisateurUid } from '@/domain/Utilisateur'
import { GouvernanceRepository } from '@/use-cases/commands/AjouterNoteDeContexteAGouvernance'

export class PrismaGouvernanceRepository implements GouvernanceRepository {
  readonly #gouvernanceDataResource = prisma.gouvernanceRecord

  async get(uid: GouvernanceUid): Promise<Gouvernance> {
    const record = await this.#gouvernanceDataResource.findUniqueOrThrow({
      include: {
        relationDepartement: true,
        relationEditeurNoteDeContexte: true,
        relationEditeurNotePrivee: true,
      },
      where: {
        departementCode: uid.state.value,
      },
    })
    console.log('record', record)
    const notePrivee = record.notePrivee && record.relationEditeurNotePrivee ? {
      contenu: record.notePrivee.contenu,
      dateDeModification: new Date(record.notePrivee.derniereEdition),
      uidEditeur: new UtilisateurUid({
        email: record.relationEditeurNotePrivee.ssoEmail,
        value: record.relationEditeurNotePrivee.ssoId,
      }),
    } : undefined

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    const noteDeContexte = record.noteDeContexte &&
      record.relationEditeurNoteDeContexte &&
      record.derniereEditionNoteDeContexte
      ? {
        contenu: record.noteDeContexte,
        dateDeModification: new Date(record.derniereEditionNoteDeContexte),
        uidEditeur: new UtilisateurUid({
          email: record.relationEditeurNoteDeContexte.ssoEmail,
          value: record.relationEditeurNoteDeContexte.ssoId,
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
    let noteDeContexteData
    const notePrivee = gouvernance.state.notePrivee
    const noteDeContexte = gouvernance.state.noteDeContexte

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

    if (noteDeContexte) {
      noteDeContexteData = {
        derniereEditionNoteDeContexte: noteDeContexte.dateDeModification,
        editeurNoteDeContexteId: noteDeContexte.uidEditeur,
        noteDeContexte: noteDeContexte.value,
      }
    } else {
      noteDeContexteData = {
        derniereEditionNoteDeContexte: null,
        editeurNoteDeContexteId: null,
        noteDeContexte: null,
      }
    }
    await this.#gouvernanceDataResource.update({
      // @ts-expect-error
      data: {
        ...notePriveeData,
        ...noteDeContexteData,
      },
      where: {
        departementCode: gouvernance.state.uid.value,
      },
    })
  }
}
