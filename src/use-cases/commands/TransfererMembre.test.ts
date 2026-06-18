import { beforeEach, describe, expect, it } from 'vitest'

import { MembreTransfertRepository, TransfererMembre, Transfert } from './TransfererMembre'
import { ResultAsync } from '../CommandHandler'

describe('transférer un membre', () => {
  beforeEach(() => {
    spiedTransfert = null
  })

  it('refuse le transfert vers la même structure, sans appeler le repository', async () => {
    // GIVEN
    const transferer = new TransfererMembre(new MembreTransfertRepositorySpy())

    // WHEN
    const result = await transferer.handle({
      idCible: 42,
      idMembre: 'structure-1-26',
      idSource: 42,
      uidUtilisateur: 'admin-1',
    })

    // THEN
    expect(result).toBe('transfertImpossibleMemeStructure')
    expect(spiedTransfert).toBeNull()
  })

  it('délègue au repository le transfert vers une structure distincte', async () => {
    // GIVEN
    const transferer = new TransfererMembre(new MembreTransfertRepositorySpy())

    // WHEN
    const result = await transferer.handle({
      idCible: 3,
      idMembre: 'structure-1-26',
      idSource: 7,
      uidUtilisateur: 'admin-1',
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedTransfert).toStrictEqual({
      idCible: 3,
      idMembre: 'structure-1-26',
      idSource: 7,
      parUtilisateur: 'admin-1',
    })
  })
})

let spiedTransfert: null | Transfert

class MembreTransfertRepositorySpy implements MembreTransfertRepository {
  transferer(transfert: Transfert): ResultAsync<never> {
    spiedTransfert = transfert
    return Promise.resolve('OK')
  }
}
