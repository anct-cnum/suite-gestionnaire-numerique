import * as Sentry from '@sentry/nextjs'
import { NextRequest } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

import { POST } from './route'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { AjouterDocument } from '@/use-cases/commands/AjouterDocument'

const post = POST

describe("route d'upload de document", () => {
  it("devrait retourner une 403 quand l'utilisateur n'est pas authentifié", async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(null)

    // WHEN
    const result = await post(fabriqueRequest({}))

    // THEN
    expect(result.status).toBe(403)
    await expect(result.json()).resolves.toStrictEqual({ message: 'Accès non autorisé' })
  })

  it('devrait retourner une 400 quand un champ est manquant', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(fabriqueSession())

    // WHEN
    const result = await post(fabriqueRequest({ file: fabriquePdf(), uidEditeur: '1' }))

    // THEN
    expect(result.status).toBe(400)
    await expect(result.json()).resolves.toStrictEqual({
      message: 'Fichier, uidFeuilleDeRoute ou uidEditeur manquant',
    })
  })

  it("devrait retourner une 403 quand l'utilisateur authentifié ne correspond pas à l'uidEditeur", async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(fabriqueSession())
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)

    // WHEN
    const result = await post(fabriqueRequest({ file: fabriquePdf(), uidEditeur: '2', uidFeuilleDeRoute: 'uidFdr' }))

    // THEN
    expect(result.status).toBe(403)
    await expect(result.json()).resolves.toStrictEqual({ message: 'Accès non autorisé' })
  })

  it("devrait retourner une 400 quand l'identifiant de feuille de route contient des caractères invalides", async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(fabriqueSession())
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)

    // WHEN
    const result = await post(fabriqueRequest({ file: fabriquePdf(), uidEditeur: '1', uidFeuilleDeRoute: '../autre' }))

    // THEN
    expect(result.status).toBe(400)
    await expect(result.json()).resolves.toStrictEqual({ message: 'Identifiant de feuille de route invalide' })
  })

  it('devrait retourner une 400 quand le nom du fichier ne porte pas l’extension .pdf', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(fabriqueSession())
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)

    // WHEN
    const result = await post(
      fabriqueRequest({
        file: fabriqueFichier('%PDF-1.4 contenu', 'document.txt'),
        uidEditeur: '1',
        uidFeuilleDeRoute: 'uidFdr',
      })
    )

    // THEN
    expect(result.status).toBe(400)
    await expect(result.json()).resolves.toStrictEqual({ message: 'Le fichier doit porter l’extension .pdf' })
  })

  it('devrait retourner une 400 quand le fichier dépasse 25 Mo', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(fabriqueSession())
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    const fichierTropGros = {
      name: 'document.pdf',
      size: 25 * 1024 * 1024 + 1,
    } as unknown as File

    // WHEN
    const result = await post(fabriqueRequest({ file: fichierTropGros, uidEditeur: '1', uidFeuilleDeRoute: 'uidFdr' }))

    // THEN
    expect(result.status).toBe(400)
    await expect(result.json()).resolves.toStrictEqual({ message: 'Le fichier dépasse la taille maximale de 25 Mo' })
  })

  it("devrait retourner une 400 quand le fichier n'est pas un PDF", async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(fabriqueSession())
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)

    // WHEN
    const result = await post(
      fabriqueRequest({
        file: fabriqueFichier('pas un pdf'),
        uidEditeur: '1',
        uidFeuilleDeRoute: 'uidFdr',
      })
    )

    // THEN
    expect(result.status).toBe(400)
    await expect(result.json()).resolves.toStrictEqual({ message: "Le fichier n'est pas un PDF valide" })
  })

  it("devrait retourner une 400 quand l'éditeur n'a pas les droits", async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(fabriqueSession())
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(AjouterDocument.prototype, 'handle').mockResolvedValueOnce('editeurNePeutPasAjouterDocument')
    const captureException = vi.fn<typeof Sentry.captureException>()

    // WHEN
    const result = await post(
      fabriqueRequest({ file: fabriquePdf(), uidEditeur: '1', uidFeuilleDeRoute: 'uidFdr' }),
      captureException
    )

    // THEN
    expect(result.status).toBe(400)
    await expect(result.json()).resolves.toStrictEqual({ message: "Erreur lors de l'ajout du document en base" })
  })

  it('devrait appeler le use case avec un nom assaini et retourner le lien quand tout est valide', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(fabriqueSession())
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    const handle = vi.spyOn(AjouterDocument.prototype, 'handle').mockResolvedValueOnce('OK')

    // WHEN
    const result = await post(
      fabriqueRequest({
        file: fabriquePdf('../../feuille de route.pdf'),
        uidEditeur: '1',
        uidFeuilleDeRoute: 'uidFdr',
      })
    )

    // THEN
    expect(result.status).toBe(200)
    const json = (await result.json()) as Readonly<{ href: string; nom: string }>
    expect(json.nom).toBe('feuille de route.pdf')
    expect(json.href).toMatch(/^\/api\/document-feuille-de-route\/user\/uidFdr\/[\w-]+_feuille de route\.pdf$/u)
    expect(handle).toHaveBeenCalledWith(
      expect.objectContaining({
        chemin: json.href.replace('/api/document-feuille-de-route/', ''),
        contenu: Buffer.from('%PDF-1.4 contenu'),
        nom: 'feuille de route.pdf',
        uidEditeur: 1,
        uidFeuilleDeRoute: 'uidFdr',
      })
    )
  })

  it('devrait retourner une 503 quand le stockage S3 échoue', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(fabriqueSession())
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    const erreurS3 = new Error('boom')
    erreurS3.name = 'S3ServiceException'
    vi.spyOn(AjouterDocument.prototype, 'handle').mockRejectedValueOnce(erreurS3)
    const captureException = vi.fn<typeof Sentry.captureException>()

    // WHEN
    const result = await post(
      fabriqueRequest({ file: fabriquePdf(), uidEditeur: '1', uidFeuilleDeRoute: 'uidFdr' }),
      captureException
    )

    // THEN
    expect(result.status).toBe(503)
    await expect(result.json()).resolves.toStrictEqual({
      message: "Erreur lors de l'interaction avec le stockage S3. Veuillez réessayer.",
    })
  })
})

function fabriqueSession(): Readonly<{ user: ssoGateway.Profile }> {
  return { user: { sub: 'userFooId' } as ssoGateway.Profile }
}

function fabriquePdf(nom = 'document.pdf'): File {
  return fabriqueFichier('%PDF-1.4 contenu', nom)
}

// L'implémentation jsdom de File chargée dans l'environnement de test n'expose pas arrayBuffer, d'où ce stub.
function fabriqueFichier(contenu: string, nom = 'document.pdf'): File {
  return {
    arrayBuffer: async (): Promise<ArrayBuffer> => Promise.resolve(new TextEncoder().encode(contenu).buffer),
    name: nom,
    size: contenu.length,
  } as unknown as File
}

function fabriqueRequest(champs: Readonly<Record<string, File | string>>): NextRequest {
  return {
    formData: async () =>
      Promise.resolve({
        get: (champ: string): File | null | string => champs[champ] ?? null,
      }),
  } as unknown as NextRequest
}
