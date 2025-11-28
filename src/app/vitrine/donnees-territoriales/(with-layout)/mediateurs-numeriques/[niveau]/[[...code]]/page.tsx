import { notFound } from 'next/navigation'
import { ReactElement, Suspense } from 'react'

import AsyncLoaderErrorBoundary from '@/components/AidantsMediateurs/GenericErrorBoundary'
import { StatistiquesAsyncContent, statistiquesCoopToMediateursData, StatistiquesMediateursData } from '@/components/coop/Statistiques'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { createApiCoopStatistiquesLoader } from '@/gateways/factories/apiCoopLoaderFactory'

export default async function MediateursNumeriques({ params }: Props): Promise<ReactElement> {
  const { code, niveau } = await params

  // Validation : niveau doit être 'national' ou 'departement'
  if (niveau !== 'national' && niveau !== 'departement') {
    notFound()
  }

  // Validation : si niveau = 'departement', code est obligatoire
  if (niveau === 'departement' && (code === undefined || code.length === 0)) {
    notFound()
  }

  // Extraction du code département si présent
  const codeDepartement = niveau === 'departement' && code !== undefined ? code[0] : undefined

  // Créer la promesse de récupération des statistiques
  const statistiquesPromise = recupererStatistiques(codeDepartement)

  return (
    <AsyncLoaderErrorBoundary
      fallback={
        <div className="fr-py-4w">
          <div className="fr-alert fr-alert--error">
            <p>
              Erreur de récupération de la donnée depuis la Coop
            </p>
          </div>
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="fr-py-4w">
            <div className="fr-alert fr-alert--info">
              <p>
                Récupération des données depuis la Coop
              </p>
            </div>
          </div>
        }
      >
        <StatistiquesAsyncContent statistiquesPromise={statistiquesPromise} />
      </Suspense>
    </AsyncLoaderErrorBoundary>
  )
}

async function recupererStatistiques(
  codeDepartement?: string
): Promise<ErrorViewModel | StatistiquesMediateursData> {
  try {
    const loader = createApiCoopStatistiquesLoader()
    const filtres = codeDepartement === undefined ? undefined : { departements: [codeDepartement] }
    const readModel = await loader.recupererStatistiques(filtres)
    return statistiquesCoopToMediateursData(readModel)
  } catch {
    return {
      message: 'Erreur de récupération de la donnée depuis la Coop',
      type: 'error',
    }
  }
}

type Props = Readonly<{
  params: Promise<{
    code?: ReadonlyArray<string>
    niveau: string
  }>
}>
