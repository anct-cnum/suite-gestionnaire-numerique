import * as nextCache from 'next/cache'
import { ZodIssue } from 'zod'

import { supprimerUnUtilisateurAction } from './supprimerUnUtilisateurAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { SupprimerUnUtilisateur } from '@/use-cases/commands/SupprimerUnUtilisateur'

describe('supprimer un utilisateur action', () => {
  it('quand la commande de suppression d’un utilisateur est passée, alors il est supprimé', async () => {
    // GIVEN
    const sub = 'fooId'
    const path = '/mes-utilisateurs'
    const utilisateurASupprimerUid = 'barId'
    vi.spyOn(ssoGateway, 'getSubSession').mockResolvedValueOnce(sub)
    vi.spyOn(nextCache, 'revalidatePath').mockReturnValueOnce()
    vi.spyOn(SupprimerUnUtilisateur.prototype, 'execute').mockResolvedValueOnce('OK')

    // WHEN
    const result = await supprimerUnUtilisateurAction({ path, utilisateurASupprimerUid })

    // THEN
    expect(SupprimerUnUtilisateur.prototype.execute).toHaveBeenCalledWith({
      utilisateurASupprimerUid,
      utilisateurCourantUid: sub,
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith(path)
    expect(result).toBe('OK')
  })

  it('étant donné un path incorrect, quand la suppression d’un utilisateur est passée, alors cela renvoie une erreur', async () => {
    // GIVEN
    const utilisateurASupprimerUid = 'barId'
    const pathIncorrect = ''

    // WHEN
    // @ts-expect-error
    const result = await supprimerUnUtilisateurAction({ path: pathIncorrect, utilisateurASupprimerUid })

    // THEN
    expect((result as ReadonlyArray<ZodIssue>)[0].message).toBe('Le chemin n’est pas correct')
  })
})
