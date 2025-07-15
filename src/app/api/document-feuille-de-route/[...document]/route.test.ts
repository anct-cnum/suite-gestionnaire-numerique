import { S3Client } from '@aws-sdk/client-s3'
import { NextRequest, NextResponse } from 'next/server'

import { GET } from './route'

describe('route de téléchargement de document', () => {
  it('devrait retourner une 200 quand l’utilisateur télécharge un document valide', async () => {
    // GIVEN
    const req = {
      nextUrl: {
        pathname: '/api/document-feuille-de-route/feuille-de-route-test.pdf',
      },
    } as unknown as NextRequest
    const res = {} as unknown as NextResponse

    // WHEN
    const result = await GET(req, res, {
      send: async () => Promise.resolve({
        Body: {
          transformToWebStream: () => ({}),
        },
      }),
    } as unknown as  S3Client)

    // THEN
    expect(result.status).toBe(200)
    expect(result.headers.get('Content-Type')).toBe('application/pdf')
    expect(result.headers.get('Content-Disposition')).toBe('inline; filename="feuille-de-route-test.pdf"')
  })

  it('devrait retourner une erreur quand le document est introuvable', async () => {
    // GIVEN
    const req = {
      nextUrl: {
        pathname: '/api/document-feuille-de-route/feuille-de-route-test.pdf',
      },
    } as unknown as NextRequest
    const res = {} as unknown as NextResponse

    // WHEN
    const result = await GET(req, res, {
      send: async () => Promise.reject(new Error('The specified key does not exist.')),
    } as unknown as S3Client)

    // THEN
    expect(result.status).toBe(404)
    await expect(result.json()).resolves.toStrictEqual({ message: 'Le document n\'existe pas' })
  })

  it('devrait retourner une erreur quand le corps de la réponse est vide', async () => {
    // GIVEN
    const req = {
      nextUrl: {
        pathname: '/api/document-feuille-de-route/feuille-de-route-test.pdf',
      },
    } as unknown as NextRequest
    const res = {} as unknown as NextResponse

    // WHEN
    const result = await GET(req, res, {
      send: async () => Promise.resolve({
        Body: null,
      }),
    } as unknown as S3Client)

    // THEN
    expect(result.status).toBe(404)
    await expect(result.json()).resolves.toStrictEqual({ message: 'Le document n\'existe pas' })
  })

  it('devrait retourner une erreur quand l’erreur n’est pas gérée', async () => {
    // GIVEN
    const req = {
      nextUrl: {
        pathname: '/api/document-feuille-de-route/feuille-de-route-test.pdf',
      },
    } as unknown as NextRequest
    const res = {} as unknown as NextResponse

    // WHEN
    const result = GET(req, res)

    // THEN
    await expect(result).rejects.toThrow('Region is missing')
  })
})
