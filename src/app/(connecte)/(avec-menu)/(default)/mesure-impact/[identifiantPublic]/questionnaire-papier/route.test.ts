// @vitest-environment node
import { NextRequest } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

import { GET } from './route'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { RecupererLeQuestionnairePapier } from '@/use-cases/mesure-impact/RecupererLeQuestionnairePapier'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('route du questionnaire papier', () => {
  it('refuse une personne non connectée', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(null)

    // WHEN
    const reponse = await GET(requete, parametres)

    // THEN
    expect(reponse.status).toBe(401)
  })

  it('donne le PDF, avec le logo du territoire, à une personne bêta-testeuse de la structure qui porte la campagne, à garder en cache', async () => {
    // GIVEN
    connecter()
    vi.spyOn(RecupererLeQuestionnairePapier.prototype, 'handle').mockResolvedValueOnce({
      identifiantPublic: 'sicoval',
      libelleTerritoire: 'Sicoval',
      questionnaire: { parties: [] },
    })

    // WHEN
    const reponse = await GET(requete, parametres)

    // THEN
    expect(RecupererLeQuestionnairePapier.prototype.handle).toHaveBeenCalledWith({
      identifiantPublic: 'sicoval',
      structureId: 42,
    })
    expect(reponse.status).toBe(200)
    expect(reponse.headers.get('Content-Type')).toBe('application/pdf')
    expect(reponse.headers.get('Content-Disposition')).toBe('attachment; filename="questionnaire-papier-sicoval.pdf"')
    expect(reponse.headers.get('Cache-Control')).toBe('private, max-age=86400')
    const pdf = Buffer.from(await reponse.arrayBuffer()).toString('latin1')
    expect(pdf.startsWith('%PDF-')).toBe(true)
    expect(pdf).toContain('/S /Figure')
  })

  it.each([
    { intention: 'refuse une personne d’une autre structure', resultat: 'accesRefuse' as const, statut: 403 },
    { intention: 'ne trouve pas une campagne inconnue', resultat: null, statut: 404 },
  ])('$intention', async ({ resultat, statut }) => {
    // GIVEN
    connecter()
    vi.spyOn(RecupererLeQuestionnairePapier.prototype, 'handle').mockResolvedValueOnce(resultat)

    // WHEN
    const reponse = await GET(requete, parametres)

    // THEN
    expect(reponse.status).toBe(statut)
  })
})

const requete = {} as NextRequest

const parametres = { params: Promise.resolve({ identifiantPublic: 'sicoval' }) }

function connecter(): void {
  vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: {} as ssoGateway.Profile })
  vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
  vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
    utilisateurReadModelFactory({ isBetaTesteur: true, structureId: 42 })
  )
}
