import { Prisma } from '@prisma/client'

import { PostgreUtilisateurRepository } from './PostgreUtilisateurRepository'
import prisma from '../../prisma/prismaClient'
import { Utilisateur } from '@/domain/Utilisateur'

const emailUtilisateur = 'martin.tartempion@example.net'
const uidUtilisateur = '8e39c6db-2f2a-45cf-ba65-e2831241cbe4'

describe('utilisateur repository', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  describe('mise à jour d’un utilisateur', () => {

    it('changement de rôle', async () => {
      // GIVEN
      await prisma.utilisateurRecord.create({
        data: utilisateurRecordFactory(),
      })

      // WHEN
      await new PostgreUtilisateurRepository(prisma).update(
        Utilisateur.create({
          email: emailUtilisateur,
          isSuperAdmin: true,
          nom: 'tartempion',
          prenom: 'martin',
          role: 'Instructeur',
          uid: uidUtilisateur,
        })
      )

      // THEN
      const updatedRecord = await prisma.utilisateurRecord.findUnique({
        where: {
          ssoId: uidUtilisateur,
        },
      })
      expect(updatedRecord?.role).toBe('instructeur')
    })
  })
})

function utilisateurRecordFactory(): Prisma.UtilisateurRecordCreateInput {
  return {
    dateDeCreation: new Date(0),
    email: 'martin.tartempion@example.net',
    inviteLe: new Date(0),
    isSuperAdmin: true,
    nom: 'Tartempion',
    prenom: 'Martin',
    role: 'gestionnaire_region',
    ssoId: '8e39c6db-2f2a-45cf-ba65-e2831241cbe4',
    telephone: '0102030405',
  }
}
