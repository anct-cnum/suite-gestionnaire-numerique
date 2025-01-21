
import { revalidatePath } from 'next/cache'
import { describe, it } from 'vitest'

import { ajouterUneNoteDeContexteAction } from './ajouterUneNoteDeContexteAction'
import { AjouterNoteDeContexteAGouvernance } from '@/use-cases/commands/AjouterNoteDeContexteAGouvernance'

describe('ajouter une note de contexte', () => {
  it('quand une note de contexte est ajoutée avec tous ses champs, alors cela renvoie un succès et le cache de la page appelante est purgé', async () => {
    // GIVEN
    vi.mock('next/cache', () => ({
      revalidatePath: vi.fn(),
    }))
    vi.spyOn(AjouterNoteDeContexteAGouvernance.prototype, 'execute').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await ajouterUneNoteDeContexteAction({
      contenu: '<p>ma note de contexte</p>',
      path: '/gouvernance/11',
      uidGouvernance: 'uidGouvernance',
      uidUtilisateurCourant: 'uidUtilisateurCourant',
    })

    // THEN
    expect(messages).toContain('OK')
    expect(revalidatePath).toHaveBeenCalledWith('/gouvernance/11')
    expect(AjouterNoteDeContexteAGouvernance.prototype.execute).toHaveBeenCalledWith({
      contenu: '<p>ma note de contexte</p>',
      path: '/gouvernance/11',
      uidGouvernance: 'uidGouvernance',
      uidUtilisateurCourant: 'uidUtilisateurCourant',
    })
  })

  it('quand une note de contexte est ajoutée avec un chemin de page non renseigné, alors cela renvoie une erreur', async () => {
    // WHEN
    const messages = await ajouterUneNoteDeContexteAction({
      contenu: '<p>ma note de contexte</p>',
      path: '',
      uidGouvernance: 'uidGouvernance',
      uidUtilisateurCourant: 'uidUtilisateurCourant',
    })

    // THEN
    expect(messages).toStrictEqual(['Le chemin doit être renseigné'])
  })

  it('quand le contenu est vide, alors cela renvoie une erreur de validation', async () => {
    // WHEN
    const messages = await ajouterUneNoteDeContexteAction({
      contenu: '',
      path: '/gouvernance/11',
      uidGouvernance: 'uidGouvernance',
      uidUtilisateurCourant: 'uidUtilisateurCourant',
    })

    // THEN
    expect(messages).toContain('Le contenu doit être renseigné')
  })

  it('quand l‘identifiant de gouvernance est invalide, alors cela renvoie une erreur de validation', async () => {
    // WHEN
    const messages = await ajouterUneNoteDeContexteAction({
      contenu: '<p>ma note de contexte</p>',
      path: '/gouvernance/11',
      uidGouvernance: '',
      uidUtilisateurCourant: 'uidUtilisateurCourant',
    })

    // THEN
    expect(messages).toContain('L‘identifiant de la gouvernance doit être renseigné')
  })

  it('quand l‘identifiant utilisateur est invalide, alors cela renvoie une erreur de validation', async () => {
    // WHEN
    const messages = await ajouterUneNoteDeContexteAction({
      contenu: '<p>ma note de contexte</p>',
      path: '/gouvernance/11',
      uidGouvernance: 'uidGouvernance',
      uidUtilisateurCourant: '',
    })

    // THEN
    expect(messages).toContain('L‘identifiant de l‘utilisateur courant doit être renseigné')
  })
})

