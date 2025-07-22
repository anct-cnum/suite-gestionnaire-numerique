import { ReactElement } from 'react'

import CarteFragiliteFrance from '@/components/TableauDeBord/EtatDesLieux/CarteFragiliteFrance'
import { PrismaIndicesDeFragiliteLoader } from '@/gateways/tableauDeBord/PrismaIndicesDeFragiliteLoader'

export const metadata = {
  title: 'Carte de fragilité numérique - France',
}

export default async function CarteFragiliteFrancePage(): Promise<ReactElement> {
  const loader = new PrismaIndicesDeFragiliteLoader()
  const indicesData = await loader.get('France')

  // Vérifier si les données sont valides et du bon type
  if ('type' in indicesData && indicesData.type === 'error') {
    return (
      <div className="fr-container fr-my-4w">
        <h1>
          Carte de fragilité numérique - France
        </h1>
        <CarteFragiliteFrance departementsFragilite={indicesData} />
      </div>
    )
  }

  if ('type' in indicesData && indicesData.type === 'departements') {
    return (
      <div className="fr-container fr-my-4w">
        <h1>
          Carte de fragilité numérique - France
        </h1>
        <CarteFragiliteFrance departementsFragilite={indicesData.departements} />
      </div>
    )
  }

  // Cas où les données ne sont pas du bon type
  return (
    <div className="fr-container fr-my-4w">
      <h1>
        Carte de fragilité numérique - France
      </h1>
      <CarteFragiliteFrance departementsFragilite={{
        message: 'Format de données incorrect',
        type: 'error',
      }}
      />
    </div>
  )
}