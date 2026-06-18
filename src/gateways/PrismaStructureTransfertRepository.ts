import { Prisma } from '@prisma/client'

import { deplacerNotionsDansTransaction, soumettreSoftDelete, sourceEstVide } from './shared/deplacerNotions'
import prisma from '../../prisma/prismaClient'
import { ResultAsync } from '@/use-cases/CommandHandler'
import {
  StructureTransfertRepository,
  TransfertNotions,
  TransfertNotionsFailure,
} from '@/use-cases/commands/TransfererNotionsStructure'

// Transfert d'un sous-ensemble de notions d'une structure source vers une cible. S'appuie sur le
// moteur partagé `deplacerNotions` (mutations + gardes C1/C2), puis soft-delete la source si elle
// ne porte plus rien et journalise l'opération. La fusion réutilise le même moteur (cf.
// PrismaStructureFusionRepository) avec la totalité des notions.
export class PrismaStructureTransfertRepository implements StructureTransfertRepository {
  async transfererNotions(transfert: TransfertNotions): ResultAsync<TransfertNotionsFailure> {
    try {
      return await prisma.$transaction(async (tx) => this.#transfererDansTransaction(tx, transfert))
    } catch {
      return 'transfertEchoue'
    }
  }

  async #journaliser(
    tx: Prisma.TransactionClient,
    transfert: TransfertNotions,
    sourceSupprimee: boolean
  ): Promise<void> {
    await tx.$executeRaw`
      INSERT INTO audit.structure_merge_log
        (status, dag_id, task_id, winner_id, loser_id, moved_identifiers)
      VALUES (
        'SUCCESS', 'min-ui-transfert', ${transfert.parUtilisateur},
        ${transfert.idCible}, ${transfert.idSource},
        ${JSON.stringify({ notions: transfert.notions, sourceSupprimee })}::jsonb
      )
    `
  }

  async #transfererDansTransaction(
    tx: Prisma.TransactionClient,
    transfert: TransfertNotions
  ): ResultAsync<TransfertNotionsFailure> {
    const { idCible, idSource, notions, parUtilisateur } = transfert

    const resultat = await deplacerNotionsDansTransaction(tx, { idCible, idSource, notions })
    if (resultat !== 'OK') {
      return resultat
    }

    const sourceSupprimee = await sourceEstVide(tx, idSource)
    if (sourceSupprimee) {
      await soumettreSoftDelete(tx, idSource, parUtilisateur)
    }
    await this.#journaliser(tx, transfert, sourceSupprimee)

    return 'OK'
  }
}
