'use server'

import { PutObjectCommand, S3Client, S3ClientConfig } from '@aws-sdk/client-s3'
import * as Sentry from '@sentry/nextjs'
import { nanoid } from 'nanoid'
import { NextRequest, NextResponse } from 'next/server'

import prisma from '../../../../../prisma/prismaClient'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaFeuilleDeRouteRepository } from '@/gateways/PrismaFeuilleDeRouteRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { isNullish } from '@/shared/lang'
import { AjouterDocument } from '@/use-cases/commands/AjouterDocument'

const s3Config: S3ClientConfig = {
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? '',
    secretAccessKey: process.env.S3_SECRET_KEY ?? '',
  },
  endpoint: process.env.S3_ENDPOINT ?? '',
  forcePathStyle: true,
  region: process.env.S3_REGION,
}

const s3 = new S3Client(s3Config)

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Vérification de l'authentification
    const session = await getSession()
    if (isNullish(session)) {
      return NextResponse.json(
        { message: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const fileRaw = formData.get('file') 
    const uidFeuilleDeRoute = formData.get('uidFeuilleDeRoute') as string
    const uidEditeur = formData.get('uidEditeur') as string

    if (fileRaw === null || !uidFeuilleDeRoute || !uidEditeur) {
      return NextResponse.json(
        { message: 'Fichier, uidFeuilleDeRoute ou uidEditeur manquant' },
        { status: 400 }
      )
    }

    // Vérification que l'utilisateur authentifié correspond à l'uidEditeur
    if (session?.user.sub !== uidEditeur) {
      return NextResponse.json(
        { message: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const file = fileRaw as File
    const key = await televerseVersS3(file, uidFeuilleDeRoute)
    const result = await appelUseCase({ fileName: file.name, key, uidEditeur, uidFeuilleDeRoute })

    if (result !== 'OK') {
      Sentry.captureException(new Error('Erreur lors de l\'ajout du document en base'), {
        extra: {
          fileName: file.name,
          uidEditeur,
          uidFeuilleDeRoute,
        },
        tags: {
          action: 'POST',
          location: 'document-feuille-de-route-upload',
          type: 'DATABASE_ERROR',
        },
      })
      return NextResponse.json(
        { message: 'Erreur lors de l\'ajout du document en base' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ 
      href: `/api/document-feuille-de-route/${key}`,
      nom: file.name,
    })
  } catch (error) {
    return gereErreur(error, { 
      fileName: (error as CustomError).file?.name ?? 'unknown',
      uidEditeur: (error as CustomError).uidEditeur ?? 'unknown',
      uidFeuilleDeRoute: (error as CustomError).uidFeuilleDeRoute ?? 'unknown',
    })
  }
}

interface UseCaseParams {
  fileName: string
  key: string
  uidEditeur: string
  uidFeuilleDeRoute: string
}

interface ErrorContext {
  fileName: string
  uidEditeur: string
  uidFeuilleDeRoute: string
}

interface CustomError extends Error {
  file?: { name: string }
  uidEditeur?: string
  uidFeuilleDeRoute?: string
}

async function televerseVersS3(file: File, uidFeuilleDeRoute: string): Promise<string> {
  const key = `user/${uidFeuilleDeRoute}/${nanoid()}_${file.name}`
  
  await s3.send(
    new PutObjectCommand({
      Body: Buffer.from(await file.arrayBuffer()),
      Bucket: process.env.S3_BUCKET,
      ContentType: file.type,
      Key: key,
    })
  )

  return key
}

async function appelUseCase(params: UseCaseParams): Promise<string> {
  const ajouterDocument = new AjouterDocument(
    new PrismaFeuilleDeRouteRepository(),
    new PrismaUtilisateurRepository(prisma.utilisateurRecord)
  )

  return ajouterDocument.handle({
    chemin: params.key,
    nom: params.fileName,
    uidEditeur: params.uidEditeur,
    uidFeuilleDeRoute: params.uidFeuilleDeRoute,
  })
}

function gereErreur(error: unknown, context: ErrorContext): NextResponse {
  Sentry.captureException(error, {
    extra: {
      fileName: context.fileName,
      uidEditeur: context.uidEditeur,
      uidFeuilleDeRoute: context.uidFeuilleDeRoute,
    },
    tags: {
      action: 'POST',
      location: 'document-feuille-de-route-upload',
      type: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
    },
  })

  if (error instanceof Error) {
    if (error.name.includes('S3')) {
      return NextResponse.json(
        { message: 'Erreur lors de l\'interaction avec le stockage S3. Veuillez réessayer.' },
        { status: 503 }
      )
    }

    if (error.name.includes('Prisma')) {
      return NextResponse.json(
        { message: 'Erreur lors de l\'interaction avec la base de données. Veuillez réessayer.' },
        { status: 503 }
      )
    }

    if (error.name === 'TypeError') {
      return NextResponse.json(
        { message: 'Erreur lors du traitement du fichier. Format de fichier invalide.' },
        { status: 400 }
      )
    }
  }

  return NextResponse.json(
    { message: 'Une erreur inattendue s\'est produite. Veuillez réessayer.' },
    { status: 500 }
  )
} 