// eslint-disable devrait être inutile mais la configuration ne fonctionne pas sans ça
/* eslint-disable import/no-restricted-paths */
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { describe, expect, it, vi } from 'vitest'

import { S3DocumentGateway } from './S3DocumentGateway'

describe('s3 document gateway', () => {
  it('quand un document est téléversé, alors il est envoyé au bucket S3 avec le bon chemin et le type PDF', async () => {
    // GIVEN
    const send = vi.fn<(commande: unknown) => Promise<unknown>>().mockResolvedValueOnce({})
    const gateway = new S3DocumentGateway({ send } as unknown as S3Client)
    const contenu = Buffer.from('%PDF-1.4 contenu')

    // WHEN
    await gateway.televerser('user/uidFeuilleDeRoute/document.pdf', contenu)

    // THEN
    expect(send).toHaveBeenCalledTimes(1)
    const commande = send.mock.calls[0][0] as PutObjectCommand
    expect(commande).toBeInstanceOf(PutObjectCommand)
    expect(commande.input).toStrictEqual({
      Body: contenu,
      Bucket: process.env.S3_BUCKET,
      ContentType: 'application/pdf',
      Key: 'user/uidFeuilleDeRoute/document.pdf',
    })
  })

  it('quand un document est récupéré, alors son flux est retourné', async () => {
    // GIVEN
    const flux = {}
    const send = vi.fn<(commande: unknown) => Promise<unknown>>().mockResolvedValueOnce({
      Body: {
        transformToWebStream: (): unknown => flux,
      },
    })
    const gateway = new S3DocumentGateway({ send } as unknown as S3Client)

    // WHEN
    const resultat = await gateway.recuperer('user/uidFeuilleDeRoute/document.pdf')

    // THEN
    expect(send).toHaveBeenCalledTimes(1)
    const commande = send.mock.calls[0][0] as GetObjectCommand
    expect(commande).toBeInstanceOf(GetObjectCommand)
    expect(commande.input).toStrictEqual({
      Bucket: process.env.S3_BUCKET,
      Key: 'user/uidFeuilleDeRoute/document.pdf',
    })
    expect(resultat).toBe(flux)
  })

  it('quand un document est récupéré sans corps, alors undefined est retourné', async () => {
    // GIVEN
    const send = vi.fn<(commande: unknown) => Promise<unknown>>().mockResolvedValueOnce({ Body: undefined })
    const gateway = new S3DocumentGateway({ send } as unknown as S3Client)

    // WHEN
    const resultat = await gateway.recuperer('user/uidFeuilleDeRoute/document.pdf')

    // THEN
    expect(resultat).toBeUndefined()
  })

  it("quand le poids d'un document est demandé, alors il est lu dans les en-têtes, sans télécharger le document", async () => {
    // GIVEN
    const send = vi.fn<(commande: unknown) => Promise<unknown>>().mockResolvedValueOnce({ ContentLength: 1_638_400 })
    const gateway = new S3DocumentGateway({ send } as unknown as S3Client, new Map())

    // WHEN
    const poids = await gateway.lirePoids('user/uidFeuilleDeRoute/document.pdf')

    // THEN
    expect(send).toHaveBeenCalledTimes(1)
    const commande = send.mock.calls[0][0] as HeadObjectCommand
    expect(commande).toBeInstanceOf(HeadObjectCommand)
    expect(commande.input).toStrictEqual({
      Bucket: process.env.S3_BUCKET,
      Key: 'user/uidFeuilleDeRoute/document.pdf',
    })
    expect(poids).toBe(1_638_400)
  })

  it("quand le poids d'un document a déjà été lu, alors il est servi depuis le cache, sans nouvel appel au stockage", async () => {
    // GIVEN
    const send = vi.fn<(commande: unknown) => Promise<unknown>>().mockResolvedValueOnce({ ContentLength: 12_000 })
    const gateway = new S3DocumentGateway({ send } as unknown as S3Client, new Map())
    await gateway.lirePoids('user/uidFeuilleDeRoute/document.pdf')

    // WHEN
    const poids = await gateway.lirePoids('user/uidFeuilleDeRoute/document.pdf')

    // THEN
    expect(send).toHaveBeenCalledTimes(1)
    expect(poids).toBe(12_000)
  })

  it("quand le stockage ne donne pas le poids, alors il reste inconnu et n'est pas mis en cache", async () => {
    // GIVEN
    const send = vi
      .fn<(commande: unknown) => Promise<unknown>>()
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ ContentLength: 12_000 })
    const gateway = new S3DocumentGateway({ send } as unknown as S3Client, new Map())

    // WHEN
    const poidsInconnu = await gateway.lirePoids('user/uidFeuilleDeRoute/document.pdf')
    const poidsRelu = await gateway.lirePoids('user/uidFeuilleDeRoute/document.pdf')

    // THEN
    expect(poidsInconnu).toBeUndefined()
    expect(poidsRelu).toBe(12_000)
    expect(send).toHaveBeenCalledTimes(2)
  })
})
