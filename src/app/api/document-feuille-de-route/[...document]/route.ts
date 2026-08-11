'use server'

import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'

import { PrismaDocumentFeuilleDeRouteLoader } from '@/gateways/PrismaDocumentFeuilleDeRouteLoader'
import { S3DocumentGateway } from '@/gateways/S3DocumentGateway'
import { isNullish } from '@/shared/lang'

// Pas d'authentification requise : ces documents sont publics (exposés sur le site vitrine).
// Les opérations d'écriture (upload, suppression) sont protégées dans leurs actions respectives.
export async function GET(
  request: NextRequest,
  _response: NextResponse,
  s3Gateway: S3DocumentGateway = new S3DocumentGateway(),
  captureException: typeof Sentry.captureException = Sentry.captureException,
  nomDocumentLoader: PrismaDocumentFeuilleDeRouteLoader = new PrismaDocumentFeuilleDeRouteLoader()
): Promise<NextResponse<null | object>> {
  const nameFile = decodeURIComponent(request.nextUrl.pathname).split('/api/document-feuille-de-route/')[1]

  // Validation du chemin pour éviter le path traversal
  if (!nameFile || nameFile.includes('..') || !nameFile.startsWith('user/')) {
    captureException(new Error('Chemin de document invalide'), {
      extra: {
        chemin: nameFile,
      },
      tags: {
        action: 'GET',
        location: 'document-feuille-de-route-download',
        type: 'INVALID_PATH',
      },
    })
    return NextResponse.json({ message: 'Chemin de document invalide' }, { status: 400 })
  }

  try {
    const flux = await s3Gateway.recuperer(nameFile)
    if (isNullish(flux)) {
      throw new Error('document_empty_body')
    }
    const nom = (await nomDocumentLoader.recupererNom(nameFile)) ?? nameFile
    return new NextResponse(flux, {
      headers: {
        'Content-Disposition': `inline; filename="${encodeURIComponent(nom)}"`,
        'Content-Type': 'application/pdf',
      },
      status: 200,
    })
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === 'The specified key does not exist.' || error.message === 'document_empty_body')
    ) {
      captureException(error, {
        extra: {
          chemin: nameFile,
        },
        tags: {
          action: 'GET',
          location: 'document-feuille-de-route-download',
          type: 'DOCUMENT_INTROUVABLE',
        },
      })
      return NextResponse.json({ message: "Le document n'existe pas" }, { status: 404 })
    }
    throw error
  }
}
