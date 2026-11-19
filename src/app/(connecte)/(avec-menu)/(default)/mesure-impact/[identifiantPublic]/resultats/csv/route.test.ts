import { NextRequest } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

import { GET } from './route'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { epochTime } from '@/shared/testHelper'
import { RecupererLesResultats } from '@/use-cases/mesure-impact/RecupererLesResultats'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('route de l’export CSV des résultats', () => {
  it('refuse une personne non connectée', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(null)

    // WHEN
    const reponse = await GET(requete(''), parametres)

    // THEN
    expect(reponse.status).toBe(401)
  })

  it('donne à une personne bêta-testeuse de la structure qui porte la campagne le CSV des résultats filtrés', async () => {
    // GIVEN
    connecter()
    vi.spyOn(RecupererLesResultats.prototype, 'handle').mockResolvedValueOnce({
      campagne: {
        identifiantPublic: 'sicoval',
        libelleTerritoire: 'Sicoval',
        nom: 'Pilote',
        ouverture: epochTime,
      },
      filtres: { canal: 'papier' },
      optionsDeFiltre: { codesPostaux: [], mois: [] },
      parties: [],
      resultats: {
        chiffresCles: {
          nouvellesChoses: { base: 0, nombre: 0 },
          plusALAise: { base: 0, nombre: 0 },
          progres: { base: 0, nombre: 0 },
        },
        questions: [],
        textesLibres: [],
        total: 0,
      },
    })

    // WHEN
    const reponse = await GET(requete('?canal=papier&codePostal=abc'), parametres)

    // THEN
    expect(RecupererLesResultats.prototype.handle).toHaveBeenCalledWith({
      filtres: { canal: 'papier' },
      identifiantPublic: 'sicoval',
      structureId: 42,
    })
    expect(reponse.status).toBe(200)
    expect(reponse.headers.get('Content-Type')).toBe('text/csv; charset=utf-8')
    expect(reponse.headers.get('Content-Disposition')).toBe('attachment; filename="resultats-sicoval-papier.csv"')
    // Le BOM, que `text()` retirerait, fait lire l'UTF-8 au tableur
    expect(Buffer.from(await reponse.arrayBuffer()).toString('utf8')).toBe(
      '\uFEFFPartie,Numéro,Question,Réponse,Effectif,Pourcentage,Base'
    )
  })

  it.each([
    { intention: 'refuse une personne d’une autre structure', resultat: 'accesRefuse' as const, statut: 403 },
    { intention: 'ne trouve pas une campagne inconnue', resultat: null, statut: 404 },
  ])('$intention', async ({ resultat, statut }) => {
    // GIVEN
    connecter()
    vi.spyOn(RecupererLesResultats.prototype, 'handle').mockResolvedValueOnce(resultat)

    // WHEN
    const reponse = await GET(requete(''), parametres)

    // THEN
    expect(reponse.status).toBe(statut)
  })
})

function requete(recherche: string): NextRequest {
  return new NextRequest(`http://localhost/mesure-impact/sicoval/resultats/csv${recherche}`)
}

const parametres = { params: Promise.resolve({ identifiantPublic: 'sicoval' }) }

function connecter(): void {
  vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: {} as ssoGateway.Profile })
  vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
  vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
    utilisateurReadModelFactory({ isBetaTesteur: true, structureId: 42 })
  )
}
