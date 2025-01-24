/* eslint-disable id-length */
import { Prisma } from '@prisma/client'
// eslint-disable-next-line import/no-restricted-paths
import sanitize from 'sanitize-html'

import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { UtilisateurUid } from '@/domain/Utilisateur'
import { GouvernanceRepository } from '@/use-cases/commands/AjouterNoteDeContexteAGouvernance'

const defaultOptions = {
  allowedAttributes: {
    a: ['href'],
  },
  allowedTags: [
    'p',
    'h2',
    'h3',
    'h4',
    'b',
    'strong',
    'i',
    'em',
    'ul',
    'ol',
    'li',
    'a',
  ],
}

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

  async find(uid: GouvernanceUid): Promise<Gouvernance | null> {
    const record = await this.#gouvernanceDataResource.findUnique({
      include: {
        noteDeContexte: {
          include: {
            relationUtilisateur: true,
          },
        },
        relationDepartement: true,
      },
      where: {
        departementCode: uid.state.value,
      },
    })
    if (!record) {
      return null
    }

    const noteDeContexte = record.noteDeContexte ? {
      contenu: record.noteDeContexte.contenu,
      dateDeModification: record.noteDeContexte.derniereEdition,
      uidEditeur: new UtilisateurUid({
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
      uid: record.departementCode,
    })
  }

  async update(gouvernance: Gouvernance): Promise<void> {
    const noteDeContexte = gouvernance.state.noteDeContexte
    if (noteDeContexte) {
      await this.#noteDeContexteDataResource.upsert({
        create: {
          contenu: sanitize(noteDeContexte.value, defaultOptions),
          derniereEdition: noteDeContexte.dateDeModification,
          editeurId: noteDeContexte.uidUtilisateurAyantModifiee,
          gouvernanceId: Number(gouvernance.state.uid.value),

        },
        update: {
          contenu: sanitize(noteDeContexte.value, defaultOptions),
          derniereEdition: noteDeContexte.dateDeModification,
          editeurId: noteDeContexte.uidUtilisateurAyantModifiee,
        },
        where: {
          gouvernanceId: Number(gouvernance.state.uid.value),
        },
      })
    }
  }
}
