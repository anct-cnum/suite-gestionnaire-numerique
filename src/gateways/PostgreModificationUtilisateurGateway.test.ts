import { Prisma } from '@prisma/client'

import { PostgreModificationUtilisateurGateway } from './PostgreModificationUtilisateurGateway'
import prisma from '../../prisma/prismaClient'

describe('modifier mes informations personnelles', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('quand mon compte existe alors je peux le modifier', async () => {
    // GIVEN
    const utilisateurAModifier = {
      email: 'axel@example.com',
      nom: 'Dupond',
      prenom: 'Axel',
      ssoId: ssoIdUtilisateurExistant,
      telephone: '0102030405',
    }
    await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory(utilisateurAModifier),
    })
    const modification = {
      modification: {
        email: 'axel2@example.com',
        nom: 'Dupond2',
        prenom: 'Axel2',
        telephone: '0504030201',
      },
      uid: ssoIdUtilisateurExistant,
    }
    const modifierUtilisateurGateway = new PostgreModificationUtilisateurGateway(prisma)

    // WHEN
    const result = await modifierUtilisateurGateway.update(modification)

    // THEN
    expect(result).toBe(true)
    const utilisateurModifie = await prisma.utilisateurRecord.findUnique({
      where: { ssoId: ssoIdUtilisateurExistant },
    })
    // @ts-expect-error
    delete utilisateurModifie?.id
    expect(utilisateurModifie).toStrictEqual({
      dateDeCreation: new Date(0),
      departementCode: null,
      derniereConnexion: null,
      email: 'axel2@example.com',
      groupementId: null,
      inviteLe: new Date(0),
      isSuperAdmin: false,
      isSupprime: false,
      nom: 'Dupond2',
      prenom: 'Axel2',
      regionCode: null,
      role: 'gestionnaire_region',
      ssoId: ssoIdUtilisateurExistant,
      structureId: null,
      telephone: '0504030201',
    })
  })

  it('quand mon compte n’existe pas alors je ne peux pas le modifier', async () => {
    // GIVEN
    await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory({
        ssoId: ssoIdUtilisateurExistant,
      }),
    })
    const modification = {
      modification: {
        email: 'axel2@example.com',
        nom: 'Dupond2',
        prenom: 'Axel2',
        telephone: '0504030201',
      },
      uid: '7ade55e7-3586-4f8d-9c34-f2e7abc71136',
    }
    const modifierUtilisateurGateway = new PostgreModificationUtilisateurGateway(prisma)

    // WHEN
    const result = await modifierUtilisateurGateway.update(modification)

    // THEN
    expect(result).toBe(false)
    const utilisateurModifie = await prisma.utilisateurRecord.findUnique({
      where: { ssoId: ssoIdUtilisateurExistant },
    })
    expect(utilisateurModifie?.nom).toBe('Tartempion')
    expect(utilisateurModifie?.prenom).toBe('Martin')
    expect(utilisateurModifie?.email).toBe('martin.tartempion@example.net')
    expect(utilisateurModifie?.telephone).toBe('0102030405')
  })
})

const ssoIdUtilisateurExistant = '2fa43e8e-ebd1-4d87-8fc4-4c9ae11a4a21'

function utilisateurRecordFactory(
  override: Partial<Prisma.UtilisateurRecordCreateInput>
): Prisma.UtilisateurRecordCreateInput {
  return {
    dateDeCreation: new Date(0),
    email: 'martin.tartempion@example.net',
    inviteLe: new Date(0),
    isSupprime: false,
    nom: 'Tartempion',
    prenom: 'Martin',
    role: 'gestionnaire_region',
    ssoId: '8e39c6db-2f2a-45cf-ba65-e2831241cbe4',
    telephone: '0102030405',
    ...override,
  }
}
