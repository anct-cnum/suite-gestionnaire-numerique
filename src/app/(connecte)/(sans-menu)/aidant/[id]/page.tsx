import { ReactElement } from 'react'

import AidantDetails from '@/components/AidantDetails/AidantDetails'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import PrismaAidantDetailsLoader from '@/gateways/AidantDetailsLoader'
import { presentAidantDetails } from '@/presenters/AidantDetailsPresenter'

async function AidantPage({ params, searchParams }: Props) : Promise<ReactElement>{
  const { id } = await params
  const resolvedSearchParams = await searchParams

  // Vérifier si la récupération a échoué
  function isError(data: unknown): data is ErrorViewModel {
    return data !== null && typeof data === 'object' && 'message' in data && 'type' in data
  }

  const periode = resolvedSearchParams.periode === 'journalier' ? 'journalier' : 'mensuel'

  const aidantLoader = new PrismaAidantDetailsLoader()

  const aidantResult = await aidantLoader.findById(id, periode)

  // Si aidantResult est une erreur, pas besoin de récupérer les stats
  if (isError(aidantResult)) {
    return (
      <div className="fr-container fr-py-4w">
        <div className="fr-alert fr-alert--error">
          <p>
            {aidantResult.message}
          </p>
        </div>
      </div>
    )
  }

  // Transformer les données via le presenteur
  const presentedData = presentAidantDetails(aidantResult)

  return (
    <AidantDetails data={presentedData} />
  )
}
type Props = Readonly<{
  params: Promise<Readonly<{
    id: string
  }>>
  searchParams: Promise<Readonly<{
    periode?: string
  }>>
}>
export default AidantPage
