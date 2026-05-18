import { Metadata } from 'next'
import { ReactElement } from 'react'

import AidantDetails from '@/components/AidantDetails/AidantDetails'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import PrismaAidantDetailsLoader from '@/gateways/AidantDetailsLoader'
import { presentAidantDetails } from '@/presenters/AidantDetailsPresenter'

export const metadata: Metadata = {
  title: 'Détails aidants et médiateurs numériques',
}

async function AidantPage({ params, searchParams }: Props): Promise<ReactElement> {
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
  const filAriane = (
    <FilAriane
      items={[
        { href: '/tableau-de-bord', label: 'Tableau de bord' },
        { href: '/liste-aidants-mediateurs', label: 'Liste des aidants et médiateurs' },
        { label: 'Détail aidant' },
      ]}
    />
  )

  if (isError(aidantResult)) {
    return (
      <>
        {filAriane}
        <div className="fr-container fr-py-4w">
          <div className="fr-alert fr-alert--error">
            <p>{aidantResult.message}</p>
          </div>
        </div>
      </>
    )
  }

  // Transformer les données via le presenteur
  const presentedData = presentAidantDetails(aidantResult, new Date())
  return (
    <>
      {filAriane}
      <AidantDetails data={presentedData} />
    </>
  )
}
type Props = Readonly<{
  params: Promise<
    Readonly<{
      id: string
    }>
  >
  searchParams: Promise<
    Readonly<{
      periode?: string
    }>
  >
}>
export default AidantPage
