'use server'

import { GetObjectCommand, S3Client, S3ClientConfig } from '@aws-sdk/client-s3'
import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'

const s3Config: S3ClientConfig = {
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? '',
    secretAccessKey: process.env.S3_SECRET_KEY ?? '',
  },
  endpoint: process.env.S3_ENDPOINT ?? '',
  forcePathStyle: true,
  region: process.env.S3_REGION,
}

// Pas d'authentification requise : ces documents sont publics (exposés sur le site vitrine).
// Les opérations d'écriture (upload, suppression) sont protégées dans leurs actions respectives.
export async function GET(
  request: NextRequest,
  _response: NextResponse,
  s3 = new S3Client(s3Config),
  captureException: typeof Sentry.captureException = Sentry.captureException
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
    const key = nameFile
    const recuperationPdf = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
      })
    )
    if (!recuperationPdf.Body) {
      throw new Error('document_empty_body')
    }
    return new NextResponse(recuperationPdf.Body.transformToWebStream(), {
      headers: {
        'Content-Disposition': `inline; filename="${encodeURIComponent(nameFile)}"`,
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
