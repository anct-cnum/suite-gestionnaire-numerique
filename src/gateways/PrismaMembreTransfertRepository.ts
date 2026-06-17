import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { MembreTransfertRepository, Transfert, TransfertFailure } from '@/use-cases/commands/TransfererMembre'

export class PrismaMembreTransfertRepository implements MembreTransfertRepository {
  async transferer(transfert: Transfert): ResultAsync<TransfertFailure> {
    try {
      return await prisma.$transaction(async (tx) => this.#transfererDansTransaction(tx, transfert))
    } catch {
      return 'transfertEchoue'
    }
  }

  async #transfererDansTransaction(tx: Prisma.TransactionClient, transfert: Transfert): ResultAsync<TransfertFailure> {
    const { idCible, idMembre, idSource, parUtilisateur } = transfert

    // Les deux structures doivent exister et ne pas être supprimées.
    const structures = await tx.$queryRaw<Array<{ id: number }>>`
      SELECT id FROM main.structure_administrative
      WHERE id IN (${idSource}, ${idCible}) AND deleted_at IS NULL
    `
    if (structures.length < 2) {
      return 'structureIntrouvable'
    }

    // Le membre doit exister sur la structure source.
    const membres = await tx.$queryRaw<Array<{ gouvernance_departement_code: string }>>`
      SELECT gouvernance_departement_code FROM min.membre
      WHERE id = ${idMembre} AND structure_id = ${idSource}
    `
    const membre = membres.at(0)
    if (membre === undefined) {
      return 'membreIntrouvable'
    }

    // Règle métier : interdire le double rattachement — la cible ne doit pas déjà être
    // membre de la même gouvernance.
    const doublons = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM min.membre
      WHERE structure_id = ${idCible}
        AND gouvernance_departement_code = ${membre.gouvernance_departement_code}
    `
    if (doublons.length > 0) {
      return 'transfertCreeraitDoublonMembre'
    }

    // Re-pointage du membre et de tous les utilisateurs de la source vers la cible.
    await tx.$executeRaw`
      UPDATE min.membre SET structure_id = ${idCible}
      WHERE id = ${idMembre} AND structure_id = ${idSource}
    `
    const utilisateursDeplaces = await tx.$executeRaw`
      UPDATE min.utilisateur SET structure_id = ${idCible} WHERE structure_id = ${idSource}
    `

    // Contacts : un contact déjà présent côté cible (index unique (struct, contact)) se
    // supprime côté source ; les autres se déplacent.
    const contactsSupprimes = await tx.$executeRaw`
      DELETE FROM main.contact_structure_administrative
      WHERE structure_administrative_id = ${idSource}
        AND contact_id IN (
          SELECT contact_id FROM main.contact_structure_administrative
          WHERE structure_administrative_id = ${idCible}
        )
    `
    const contactsDeplaces = await tx.$executeRaw`
      UPDATE main.contact_structure_administrative SET structure_administrative_id = ${idCible}
      WHERE structure_administrative_id = ${idSource}
    `

    // Journal d'audit : qui, quand, quoi. La structure source N'EST PAS supprimée.
    await tx.$executeRaw`
      INSERT INTO min.membre_transfert_log
        (membre_id, structure_source_id, structure_cible_id,
         utilisateurs_deplaces, contacts_deplaces, contacts_supprimes, par_utilisateur)
      VALUES (${idMembre}, ${idSource}, ${idCible},
              ${utilisateursDeplaces}, ${contactsDeplaces}, ${contactsSupprimes}, ${parUtilisateur})
    `

    return 'OK'
  }
}
