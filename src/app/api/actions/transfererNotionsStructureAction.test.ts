import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { transfererNotionsStructureAction } from './transfererNotionsStructureAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { TransfererNotionsStructure } from '@/use-cases/commands/TransfererNotionsStructure'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('transférer des notions de structure action', () => {
  it('transfère les notions et purge le cache quand un administrateur autorisé confirme', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findByUid').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: true })
    )
    vi.spyOn(TransfererNotionsStructure.prototype, 'handle').mockResolvedValueOnce('OK')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    const messages = await transfererNotionsStructureAction({
      idCible: 3,
      idSource: 7,
      notions: ['membre', 'coop'],
      path: '/structures-doublons/comparer',
    })

    // THEN
    expect(TransfererNotionsStructure.prototype.handle).toHaveBeenCalledWith({
      idCible: 3,
      idSource: 7,
      notions: ['membre', 'coop'],
      uidUtilisateur: 'userFooId',
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/structures-doublons/comparer')
    expect(messages).toStrictEqual(['OK'])
  })

  it('renvoie une erreur de validation quand aucune notion n’est sélectionnée', async () => {
    // WHEN
    const messages = await transfererNotionsStructureAction({
      idCible: 3,
      idSource: 7,
      notions: [],
      path: '/structures-doublons/comparer',
    })

    // THEN
    expect(messages).toStrictEqual(['Sélectionnez au moins une notion à transférer'])
  })

  it('refuse l’action à un utilisateur non administrateur autorisé', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findByUid').mockResolvedValueOnce(
      utilisateurReadModelFactory({
        isBetaTesteur: false,
        role: {
          categorie: 'anct',
          doesItBelongToGroupeAdmin: false,
          nom: 'Gestionnaire structure',
          organisation: '',
          rolesGerables: [],
          type: 'gestionnaire_structure',
        },
      })
    )

    // WHEN
    const messages = await transfererNotionsStructureAction({
      idCible: 3,
      idSource: 7,
      notions: ['membre'],
      path: '/structures-doublons/comparer',
    })

    // THEN
    expect(messages).toStrictEqual(['Action réservée aux administrateurs autorisés'])
  })

  it('remonte le message d’échec métier renvoyé par la commande', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findByUid').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: true })
    )
    vi.spyOn(TransfererNotionsStructure.prototype, 'handle').mockResolvedValueOnce('collisionMembreGouvernance')

    // WHEN
    const messages = await transfererNotionsStructureAction({
      idCible: 3,
      idSource: 7,
      notions: ['membre'],
      path: '/structures-doublons/comparer',
    })

    // THEN
    expect(messages).toStrictEqual(['La structure cible est déjà membre d’une gouvernance de la structure source'])
  })
})
