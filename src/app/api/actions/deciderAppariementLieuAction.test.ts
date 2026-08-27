import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { deciderAppariementLieuAction } from './deciderAppariementLieuAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { DeciderAppariementLieu } from '@/use-cases/commands/DeciderAppariementLieu'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('décider un appariement de lieu action', () => {
  it('valide la paire au nom de l’administrateur connecté et purge le cache', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ email: 'admin@example.net' })
    )
    vi.spyOn(DeciderAppariementLieu.prototype, 'handle').mockResolvedValueOnce('OK')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    const messages = await deciderAppariementLieuAction({
      cartoRecordId: 'RhinOcc_QxE__RhinOcc_RCR',
      decision: 'valide',
      lieuId: 14800,
      path: '/appariements-lieux',
    })

    // THEN
    expect(DeciderAppariementLieu.prototype.handle).toHaveBeenCalledWith({
      cartoRecordId: 'RhinOcc_QxE__RhinOcc_RCR',
      decidePar: 'admin@example.net',
      decision: 'valide',
      lieuId: 14800,
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/appariements-lieux')
    expect(messages).toStrictEqual(['OK'])
  })

  it('renvoie les erreurs de validation quand les paramètres sont invalides', async () => {
    // WHEN
    const messages = await deciderAppariementLieuAction({
      cartoRecordId: '',
      decision: 'peut-etre',
      lieuId: 0,
      path: '/appariements-lieux',
    })

    // THEN
    expect(messages).toStrictEqual([
      'L’identifiant du record cartographie doit être renseigné',
      'La décision doit être « valide » ou « rejete »',
      'L’identifiant du lieu doit être un entier positif',
    ])
  })

  it('traduit l’échec quand la paire est déjà décidée', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(utilisateurReadModelFactory())
    vi.spyOn(DeciderAppariementLieu.prototype, 'handle').mockResolvedValueOnce('appariementIntrouvable')

    // WHEN
    const messages = await deciderAppariementLieuAction({
      cartoRecordId: 'dora_1',
      decision: 'rejete',
      lieuId: 1,
      path: '/appariements-lieux',
    })

    // THEN
    expect(messages).toStrictEqual(['Appariement introuvable ou déjà décidé'])
  })

  it('refuse l’action à un utilisateur qui n’est pas administrateur', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ role: { ...utilisateurReadModelFactory().role, type: 'gestionnaire_departement' } })
    )

    // WHEN
    const messages = await deciderAppariementLieuAction({
      cartoRecordId: 'dora_1',
      decision: 'valide',
      lieuId: 1,
      path: '/appariements-lieux',
    })

    // THEN
    expect(messages).toStrictEqual(['Action réservée aux administrateurs'])
  })
})
