import { S3Client } from '@aws-sdk/client-s3'
import { NextRequest, NextResponse } from 'next/server'

import { GET } from './route'

describe('route /api/document-feuille-de-route/[...document]', () => {
  it('devrait retourner une 200 quand l’utilisateur télécharge un Pdf valide', async () => {
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

  it('devrait retourner une erreur quand le pdf est introuvable', async () => {
    // GIVEN
    const req = {
      nextUrl: {
        pathname: '/api/document-feuille-de-route/feuille-de-route-test.pdf',
      },
    } as unknown as NextRequest
    const res = {} as unknown as NextResponse

    // WHEN
    const result = GET(req, res, {
      send: async () => Promise.resolve({
        Body: null,
      }),
    } as unknown as S3Client)

    // THEN
    await expect(result).rejects.toMatchObject({
      message: 'Le PDF n’existe pas',
    })
  })

  it('devrait retourner une erreur différente de pdf introuvable', async () => {
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
    await expect(result).rejects.toMatchObject({
      message: 'Region is missing',
    })
  })
})
