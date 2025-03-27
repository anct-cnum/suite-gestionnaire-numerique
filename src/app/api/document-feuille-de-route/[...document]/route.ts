'use server'

import { S3Client, GetObjectCommand, S3ClientConfig } from '@aws-sdk/client-s3'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, _response: NextResponse, s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  },
  endpoint: 'https://s3.fr-par.scw.cloud',
  region: process.env.AWS_S3_REGION,
} as S3ClientConfig)): Promise<NextResponse<object | null>> {
  try {
    const nameFile = decodeURIComponent(request.nextUrl.pathname).split('/api/document-feuille-de-route/')[1]
    const recuperationPdf = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: nameFile,
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
    if (error instanceof Error && (error.message === 'The specified key does not exist.' || error.message === 'document_empty_body')) {
      return NextResponse.json({ message: 'Le document n’existe pas' }, { status: 404 })
    }
    throw error
  }
}

