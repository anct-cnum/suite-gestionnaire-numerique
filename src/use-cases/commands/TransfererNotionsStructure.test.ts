import { beforeEach, describe, expect, it } from 'vitest'

import {
  StructureTransfertRepository,
  TransfererNotionsStructure,
  TransfertNotions,
  TransfertNotionsFailure,
} from './TransfererNotionsStructure'
import { ResultAsync } from '@/use-cases/CommandHandler'

describe('transférer des notions entre structures', () => {
  beforeEach(() => {
    spiedTransfert = null
  })

  it('refuse de transférer une structure vers elle-même, sans toucher au repository', async () => {
    // GIVEN
    const transferer = new TransfererNotionsStructure(repositoryQuiRend('OK'))

    // WHEN
    const result = await transferer.handle({ idCible: 5, idSource: 5, notions: ['membre'], uidUtilisateur: 'bob' })

    // THEN
    expect(result).toBe('transfertImpossibleMemeStructure')
    expect(spiedTransfert).toBeNull()
  })

  it('refuse un transfert sans aucune notion sélectionnée, sans toucher au repository', async () => {
    // GIVEN
    const transferer = new TransfererNotionsStructure(repositoryQuiRend('OK'))

    // WHEN
    const result = await transferer.handle({ idCible: 2, idSource: 1, notions: [], uidUtilisateur: 'bob' })

    // THEN
    expect(result).toBe('aucuneNotionSelectionnee')
    expect(spiedTransfert).toBeNull()
  })

  it('délègue au repository les notions sélectionnées et l’utilisateur, puis renvoie son résultat', async () => {
    // GIVEN
    const transferer = new TransfererNotionsStructure(repositoryQuiRend('OK'))

    // WHEN
    const result = await transferer.handle({
      idCible: 2,
      idSource: 1,
      notions: ['membre', 'coop'],
      uidUtilisateur: 'alice',
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedTransfert).toStrictEqual({
      idCible: 2,
      idSource: 1,
      notions: ['membre', 'coop'],
      parUtilisateur: 'alice',
    })
  })

  it('propage un échec métier remonté par le repository', async () => {
    // GIVEN
    const transferer = new TransfererNotionsStructure(repositoryQuiRend('collisionIdentifiantSource'))

    // WHEN
    const result = await transferer.handle({ idCible: 2, idSource: 1, notions: ['coop'], uidUtilisateur: 'alice' })

    // THEN
    expect(result).toBe('collisionIdentifiantSource')
  })
})

let spiedTransfert: null | TransfertNotions

function repositoryQuiRend(resultat: 'OK' | TransfertNotionsFailure): StructureTransfertRepository {
  return {
    transfererNotions(transfert: TransfertNotions): ResultAsync<TransfertNotionsFailure> {
      spiedTransfert = transfert
      return Promise.resolve(resultat)
    },
  }
}
