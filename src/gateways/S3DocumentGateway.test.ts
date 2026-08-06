// eslint-disable devrait être inutile mais la configuration ne fonctionne pas sans ça
/* eslint-disable import/no-restricted-paths */
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
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
})
