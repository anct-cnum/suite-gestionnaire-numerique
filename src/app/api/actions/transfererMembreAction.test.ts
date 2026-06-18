import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { transfererMembreAction } from './transfererMembreAction'
import { utilisateurFactory } from '@/domain/testHelper'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { TransfererMembre } from '@/use-cases/commands/TransfererMembre'

describe('transférer un membre action', () => {
  it('transfère le membre et purge le cache quand un administrateur autorisé confirme', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ isBetaTesteur: true, role: 'Administrateur dispositif' })
    )
    vi.spyOn(TransfererMembre.prototype, 'handle').mockResolvedValueOnce('OK')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    const messages = await transfererMembreAction({
      idCible: 9867,
      idMembre: 'structure-77944552700046-26',
      idSource: 9869,
      path: '/membres-a-consolider',
    })

    // THEN
    expect(TransfererMembre.prototype.handle).toHaveBeenCalledWith({
      idCible: 9867,
      idMembre: 'structure-77944552700046-26',
      idSource: 9869,
      uidUtilisateur: 'userFooId',
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/membres-a-consolider')
    expect(messages).toStrictEqual(['OK'])
  })

  it('renvoie une erreur de validation quand le membre n’est pas renseigné', async () => {
    // WHEN
    const messages = await transfererMembreAction({
      idCible: 9867,
      idMembre: '',
      idSource: 9869,
      path: '/membres-a-consolider',
    })

    // THEN
    expect(messages).toStrictEqual(['Le membre doit être renseigné'])
  })

  it('refuse l’action à un utilisateur non administrateur autorisé', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ isBetaTesteur: false, role: 'Gestionnaire structure' })
    )

    // WHEN
    const messages = await transfererMembreAction({
      idCible: 9867,
      idMembre: 'structure-77944552700046-26',
      idSource: 9869,
      path: '/membres-a-consolider',
    })

    // THEN
    expect(messages).toStrictEqual(['Action réservée aux administrateurs autorisés'])
  })

  it('remonte le message d’échec métier renvoyé par la commande', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ isBetaTesteur: true, role: 'Administrateur dispositif' })
    )
    vi.spyOn(TransfererMembre.prototype, 'handle').mockResolvedValueOnce('transfertCreeraitDoublonMembre')

    // WHEN
    const messages = await transfererMembreAction({
      idCible: 9867,
      idMembre: 'structure-77944552700046-26',
      idSource: 9869,
      path: '/membres-a-consolider',
    })

    // THEN
    expect(messages).toStrictEqual(['La structure cible est déjà membre de cette gouvernance'])
  })
})
