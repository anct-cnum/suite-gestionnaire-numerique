'use server'

import * as Sentry from '@sentry/nextjs'
import { nanoid } from 'nanoid'
import { NextRequest, NextResponse } from 'next/server'

import prisma from '../../../../../prisma/prismaClient'
import { avecJournalisationMin } from '../../actions/shared/journalisation'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaFeuilleDeRouteRepository } from '@/gateways/PrismaFeuilleDeRouteRepository'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { S3DocumentGateway } from '@/gateways/S3DocumentGateway'
import { isNullish } from '@/shared/lang'
import { AjouterDocument } from '@/use-cases/commands/AjouterDocument'

const tailleMaxEnOctets = 25 * 1024 * 1024
const enTetePdf = '%PDF-'

export async function POST(
  request: NextRequest,
  captureException: typeof Sentry.captureException = Sentry.captureException
): Promise<NextResponse> {
  return avecJournalisationMin(async () => {
    try {
      // Vérification de l'authentification
      const session = await getSession()
      if (isNullish(session)) {
        return NextResponse.json({ message: 'Accès non autorisé' }, { status: 403 })
      }

      const formData = await request.formData()
      const fileRaw = formData.get('file')
      const uidFeuilleDeRoute = formData.get('uidFeuilleDeRoute') as string
      const uidEditeur = formData.get('uidEditeur') as string

      if (fileRaw === null || !uidFeuilleDeRoute || !uidEditeur) {
        return NextResponse.json({ message: 'Fichier, uidFeuilleDeRoute ou uidEditeur manquant' }, { status: 400 })
      }

      // Vérification que l'utilisateur authentifié correspond à l'uidEditeur
      if (session?.user.sub !== uidEditeur) {
        return NextResponse.json({ message: 'Accès non autorisé' }, { status: 403 })
      }

      if (!/^[\w-]+$/u.test(uidFeuilleDeRoute)) {
        return NextResponse.json({ message: 'Identifiant de feuille de route invalide' }, { status: 400 })
      }

      const file = fileRaw as File
      if (file.size > tailleMaxEnOctets) {
        return NextResponse.json({ message: 'Le fichier dépasse la taille maximale de 25 Mo' }, { status: 400 })
      }

      const contenu = Buffer.from(await file.arrayBuffer())
      if (contenu.subarray(0, enTetePdf.length).toString('latin1') !== enTetePdf) {
        return NextResponse.json({ message: "Le fichier n'est pas un PDF valide" }, { status: 400 })
      }

      const nomDeFichier = assainitNomDeFichier(file.name)
      const chemin = `user/${uidFeuilleDeRoute}/${nanoid()}_${nomDeFichier}`

      const result = await appelUseCase({ chemin, contenu, nom: nomDeFichier, uidEditeur, uidFeuilleDeRoute })

      if (result !== 'OK') {
        captureException(new Error("Erreur lors de l'ajout du document en base"), {
          extra: {
            fileName: nomDeFichier,
            uidEditeur,
            uidFeuilleDeRoute,
          },
          tags: {
            action: 'POST',
            location: 'document-feuille-de-route-upload',
            type: 'DATABASE_ERROR',
          },
        })
        return NextResponse.json({ message: "Erreur lors de l'ajout du document en base" }, { status: 400 })
      }

      return NextResponse.json({
        href: `/api/document-feuille-de-route/${chemin}`,
        nom: nomDeFichier,
      })
    } catch (error) {
      return gereErreur(
        error,
        {
          fileName: (error as CustomError).file?.name ?? 'unknown',
          uidEditeur: (error as CustomError).uidEditeur ?? 'unknown',
          uidFeuilleDeRoute: (error as CustomError).uidFeuilleDeRoute ?? 'unknown',
        },
        captureException
      )
    }
  })
}

function assainitNomDeFichier(nom: string): string {
  const nomSansChemin = nom.split(/[/\\]/u).pop() ?? ''
  const nomPropre = Array.from(nomSansChemin)
    .filter((caractere) => caractere >= ' ' && !'<>:"|?*'.includes(caractere))
    .join('')
    .trim()

  return nomPropre === '' ? 'document.pdf' : nomPropre
}

async function appelUseCase(params: UseCaseParams): Promise<string> {
  const ajouterDocument = new AjouterDocument(
    new PrismaFeuilleDeRouteRepository(),
    new PrismaGouvernanceRepository(),
    new S3DocumentGateway(),
    new PrismaUtilisateurRepository(prisma.utilisateurRecord)
  )

  return ajouterDocument.handle({
    chemin: params.chemin,
    contenu: params.contenu,
    date: new Date().toISOString(),
    nom: params.nom,
    uidEditeur: params.uidEditeur,
    uidFeuilleDeRoute: params.uidFeuilleDeRoute,
  })
}

function gereErreur(
  error: unknown,
  context: ErrorContext,
  captureException: typeof Sentry.captureException
): NextResponse {
  captureException(error, {
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
        { message: "Erreur lors de l'interaction avec le stockage S3. Veuillez réessayer." },
        { status: 503 }
      )
    }

    if (error.name.includes('Prisma')) {
      return NextResponse.json(
        { message: "Erreur lors de l'interaction avec la base de données. Veuillez réessayer." },
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

  return NextResponse.json({ message: "Une erreur inattendue s'est produite. Veuillez réessayer." }, { status: 500 })
}

type UseCaseParams = Readonly<{
  chemin: string
  contenu: Buffer
  nom: string
  uidEditeur: string
  uidFeuilleDeRoute: string
}>

type ErrorContext = Readonly<{
  fileName: string
  uidEditeur: string
  uidFeuilleDeRoute: string
}>

type CustomError = Error &
  Readonly<{
    file?: Readonly<{ name: string }>
    uidEditeur?: string
    uidFeuilleDeRoute?: string
  }>
