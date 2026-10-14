import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { MockSireneLoader } from './MockSireneLoader'
import prisma from '../../../prisma/prismaClient'
import { creerUneStructure } from '../testHelper'

describe('mock sirene loader (développement)', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('quand le SIRET réservé aux entreprises introuvables est recherché, alors aucune entreprise n’est trouvée', async () => {
    // WHEN
    const resultat = await new MockSireneLoader().rechercherParIdentifiant('00000000000000')

    // THEN
    expect(resultat).toStrictEqual({ estTrouvee: false })
  })

  it('quand le SIRET d’une structure connue en base est recherché, alors l’entreprise porte le nom de cette structure', async () => {
    // GIVEN
    await creerUneStructure({ id: 978, identifiantEtablissement: '12345678901234', nom: 'Ma structure connue' })

    // WHEN
    const resultat = await new MockSireneLoader().rechercherParIdentifiant('12345678901234')

    // THEN
    expect(resultat).toMatchObject({ denomination: 'Ma structure connue', identifiant: '12345678901234' })
  })

  it('quand un SIRET inconnu en base est recherché, alors une entreprise fictive est renvoyée', async () => {
    // WHEN
    const resultat = await new MockSireneLoader().rechercherParIdentifiant('98765432109876')

    // THEN
    expect(resultat).toMatchObject({ denomination: 'STRUCTURE FICTIVE 98765432109876', identifiant: '98765432109876' })
  })
})
