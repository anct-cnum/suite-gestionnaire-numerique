import { S3Client } from '@aws-sdk/client-s3'
import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

import { GET } from './route'
import { S3DocumentGateway } from '@/gateways/S3DocumentGateway'

describe('route de téléchargement de document', () => {
  it("devrait retourner une 200 quand l'utilisateur télécharge un document valide", async () => {
    // GIVEN
    const req = {
      nextUrl: {
        pathname: '/api/document-feuille-de-route/user/fdr-uid/feuille-de-route-test.pdf',
      },
    } as unknown as NextRequest
    const res = {} as unknown as NextResponse

    // WHEN
    const result = await GET(
      req,
      res,
      new S3DocumentGateway({
        send: async () =>
          Promise.resolve({
            Body: {
              transformToWebStream: () => ({}),
            },
          }),
      } as unknown as S3Client)
    )

    // THEN
    expect(result.status).toBe(200)
    expect(result.headers.get('Content-Type')).toBe('application/pdf')
    expect(result.headers.get('Content-Disposition')).toBe(
      'inline; filename="user%2Ffdr-uid%2Ffeuille-de-route-test.pdf"'
    )
  })

  it('devrait retourner une erreur et notifier Sentry quand le document est introuvable', async () => {
    // GIVEN
    const req = {
      nextUrl: {
        pathname: '/api/document-feuille-de-route/user/fdr-uid/feuille-de-route-test.pdf',
      },
    } as unknown as NextRequest
    const res = {} as unknown as NextResponse
    const captureException = vi.fn<typeof Sentry.captureException>()

    // WHEN
    const result = await GET(
      req,
      res,
      new S3DocumentGateway({
        send: async () => Promise.reject(new Error('The specified key does not exist.')),
      } as unknown as S3Client),
      captureException
    )

    // THEN
    expect(result.status).toBe(404)
    await expect(result.json()).resolves.toStrictEqual({ message: "Le document n'existe pas" })
    expect(captureException).toHaveBeenCalledWith(new Error('The specified key does not exist.'), {
      extra: {
        chemin: 'user/fdr-uid/feuille-de-route-test.pdf',
      },
      tags: {
        action: 'GET',
        location: 'document-feuille-de-route-download',
        type: 'DOCUMENT_INTROUVABLE',
      },
    })
  })

  it('devrait retourner une erreur et notifier Sentry quand le corps de la réponse est vide', async () => {
    // GIVEN
    const req = {
      nextUrl: {
        pathname: '/api/document-feuille-de-route/user/fdr-uid/feuille-de-route-test.pdf',
      },
    } as unknown as NextRequest
    const res = {} as unknown as NextResponse
    const captureException = vi.fn<typeof Sentry.captureException>()

    // WHEN
    const result = await GET(
      req,
      res,
      new S3DocumentGateway({
        send: async () =>
          Promise.resolve({
            Body: null,
          }),
      } as unknown as S3Client),
      captureException
    )

    // THEN
    expect(result.status).toBe(404)
    await expect(result.json()).resolves.toStrictEqual({ message: "Le document n'existe pas" })
    expect(captureException).toHaveBeenCalledWith(new Error('document_empty_body'), {
      extra: {
        chemin: 'user/fdr-uid/feuille-de-route-test.pdf',
      },
      tags: {
        action: 'GET',
        location: 'document-feuille-de-route-download',
        type: 'DOCUMENT_INTROUVABLE',
      },
    })
  })

  it("devrait retourner une erreur quand l'erreur n'est pas gérée", async () => {
    // GIVEN
    const req = {
      nextUrl: {
        pathname: '/api/document-feuille-de-route/user/fdr-uid/feuille-de-route-test.pdf',
      },
    } as unknown as NextRequest
    const res = {} as unknown as NextResponse

    // WHEN
    const result = GET(
      req,
      res,
      new S3DocumentGateway({
        send: async () => Promise.reject(new Error('erreur non gérée')),
      } as unknown as S3Client)
    )

    // THEN
    await expect(result).rejects.toThrow('erreur non gérée')
  })

  it('devrait retourner 400 et notifier Sentry quand le chemin contient un path traversal', async () => {
    // GIVEN
    const req = {
      nextUrl: {
        pathname: '/api/document-feuille-de-route/../../../etc/passwd',
      },
    } as unknown as NextRequest
    const res = {} as unknown as NextResponse
    const captureException = vi.fn<typeof Sentry.captureException>()

    // WHEN
    const result = await GET(req, res, {} as unknown as S3DocumentGateway, captureException)

    // THEN
    expect(result.status).toBe(400)
    await expect(result.json()).resolves.toStrictEqual({ message: 'Chemin de document invalide' })
    expect(captureException).toHaveBeenCalledWith(new Error('Chemin de document invalide'), {
      extra: {
        chemin: '../../../etc/passwd',
      },
      tags: {
        action: 'GET',
        location: 'document-feuille-de-route-download',
        type: 'INVALID_PATH',
      },
    })
  })

  it('devrait retourner 400 quand le chemin ne commence pas par user/', async () => {
    // GIVEN
    const req = {
      nextUrl: {
        pathname: '/api/document-feuille-de-route/other-prefix/document.pdf',
      },
    } as unknown as NextRequest
    const res = {} as unknown as NextResponse

    // WHEN
    const result = await GET(req, res, {} as unknown as S3DocumentGateway)

    // THEN
    expect(result.status).toBe(400)
    await expect(result.json()).resolves.toStrictEqual({ message: 'Chemin de document invalide' })
  })
})
