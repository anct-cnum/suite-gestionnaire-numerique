
import * as nextCache from 'next/cache'
import { describe, it } from 'vitest'

import { ajouterUneNoteDeContexteAction } from './ajouterUneNoteDeContexteAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { AjouterNoteDeContexteAGouvernance } from '@/use-cases/commands/AjouterNoteDeContexteAGouvernance'

describe('ajouter une note de contexte', () => {
  it('quand une note de contexte est ajoutée avec tous ses champs, alors cela renvoie un succès et le cache de la page appelante est purgé', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())
    vi.spyOn(AjouterNoteDeContexteAGouvernance.prototype, 'execute').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await ajouterUneNoteDeContexteAction({
      contenu: '<p>ma note de contexte</p>',
      path: '/gouvernance/11',
      uidGouvernance: 'uidGouvernance',
    })

    // THEN
    expect(messages).toStrictEqual(['OK'])
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/gouvernance/11')
    expect(AjouterNoteDeContexteAGouvernance.prototype.execute).toHaveBeenCalledWith({
      contenu: '<p>ma note de contexte</p>',
      uidGouvernance: 'uidGouvernance',
      uidUtilisateurCourant: 'userFooId',
    })
  })

  it('quand une note de contexte est ajoutée avec un chemin de page non renseigné, alors cela renvoie une erreur', async () => {
    // WHEN
    const messages = await ajouterUneNoteDeContexteAction({
      contenu: '<p>ma note de contexte</p>',
      path: '',
      uidGouvernance: 'uidGouvernance',
    })

    // THEN
    expect(messages).toStrictEqual(['Le chemin doit être renseigné'])
  })
})

