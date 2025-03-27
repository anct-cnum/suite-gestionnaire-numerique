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
      return NextResponse.json({ message: 'Le PDF est vide' }, { status: 403 })
    }
    return new NextResponse(recuperationPdf.Body.transformToWebStream(), {
      headers: {
        'Content-Disposition': `inline; filename="${encodeURIComponent(nameFile)}"`,
        'Content-Type': 'application/pdf',
      },
      status: 200,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'The specified key does not exist.') {
      return NextResponse.json({ message: 'Le PDF n’existe pas' }, { status: 404 })
    }
    throw new Error(String(error))
  }
}

