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

async function AidantPage({ params }: Props): Promise<ReactElement> {
  const { id } = await params

  // Vérifier si la récupération a échoué
  function isError(data: unknown): data is ErrorViewModel {
    return data !== null && typeof data === 'object' && 'message' in data && 'type' in data
  }

  const aidantLoader = new PrismaAidantDetailsLoader()

  const aidantResult = await aidantLoader.findById(id)
  // Si aidantResult est une erreur, pas besoin de récupérer les stats
  function buildFilAriane(dernierLabel: string): ReactElement {
    return (
      <FilAriane
        items={[
          { href: '/tableau-de-bord', label: 'Tableau de bord' },
          { href: '/liste-aidants-mediateurs', label: 'Suivi des aidants et médiateurs' },
          { label: dernierLabel },
        ]}
      />
    )
  }

  if (isError(aidantResult)) {
    return (
      <>
        {buildFilAriane('Détail aidant')}
        <div className="fr-container fr-py-4w">
          <div className="fr-alert fr-alert--error">
            <p>{aidantResult.message}</p>
          </div>
        </div>
      </>
    )
  }

  // Transformer les données via le presenteur
  const presentedData = presentAidantDetails(aidantResult)
  return (
    <>
      {buildFilAriane(`${presentedData.header.prenom} ${presentedData.header.nom}`.trim())}
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
}>
export default AidantPage
