'use server'

import { GetObjectCommand, S3Client, S3ClientConfig } from '@aws-sdk/client-s3'
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

export async function GET(request: NextRequest,
  _response: NextResponse, s3 = new S3Client(s3Config)): Promise<NextResponse<null | object>> {
  try {
    const nameFile = decodeURIComponent(request.nextUrl.pathname).split('/api/document-feuille-de-route/')[1]
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
    if (error instanceof Error && (error.message === 'The specified key does not exist.' || error.message === 'document_empty_body')) {
      return NextResponse.json({ message: 'Le document n\'existe pas' }, { status: 404 })
    }
    throw error
  }
}

