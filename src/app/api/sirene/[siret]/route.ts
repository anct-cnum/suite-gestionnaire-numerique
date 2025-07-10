import { NextRequest, NextResponse } from 'next/server'

import prisma from '../../../../../prisma/prismaClient'
import { createSireneLoader } from '@/gateways/sirene/sireneLoaderFactory'
import { RechercherUneEntreprise } from '@/use-cases/queries/RechercherUneEntreprise'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ siret: string }> }
): Promise<NextResponse> {
  try {
    const { siret } = await params

    // Validation du SIRET
    if (!siret || !/^\d{14}$/.test(siret)) {
      return NextResponse.json(
        { error: 'Le SIRET doit contenir exactement 14 chiffres' },
        { status: 400 }
      )
    }

    // Injection de dépendance : création du loader selon l'environnement
    const sireneLoader = createSireneLoader()
    const rechercherUneEntreprise = new RechercherUneEntreprise(sireneLoader)

    // Exécution du use case
    const entreprise = await rechercherUneEntreprise.handle({ siret })

    // Enrichissement avec le libellé de catégorie juridique
    let entrepriseEnrichie = { ...entreprise }
    
    if (entreprise.categorieJuridiqueUniteLegale) {
      try {
        const categorieJuridique = await prisma.categories_juridiques.findUnique({
          where: { code: entreprise.categorieJuridiqueUniteLegale },
        })
        
        if (categorieJuridique) {
          entrepriseEnrichie = {
            ...entreprise,
            categorieJuridiqueUniteLegaleLibelle: categorieJuridique.nom,
          }
        }
      } catch {
        // En cas d'erreur, on continue sans le libellé
      }
    }

    return NextResponse.json(entrepriseEnrichie)
  } catch (error)
  {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    
    // Gestion des erreurs métier
    if (errorMessage.includes('Aucun établissement trouvé') || 
        errorMessage.includes('n\'est plus en activité')) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      )
    }
    
    if (errorMessage.includes('Trop de requêtes')) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 429 }
      )
    }
    
    if (errorMessage.includes('timeout') || 
        errorMessage.includes('ECONNRESET') ||
        errorMessage.includes('Échec de connexion')) {
      return NextResponse.json(
        { error: 'Service temporairement indisponible. Veuillez réessayer.' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la recherche. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}