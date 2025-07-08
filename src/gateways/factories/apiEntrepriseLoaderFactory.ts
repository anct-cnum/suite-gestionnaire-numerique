import { RidetApiLoader } from '../apiEntreprise/ApiRidetLoader'
import { ApiSireneLoader } from '../apiEntreprise/ApiSireneLoader'
import { MockRidetLoader } from '../apiEntreprise/MockRidetLoader'
import { MockSireneLoader } from '../apiEntreprise/MockSireneLoader'
import { SireneLoader } from '@/use-cases/queries/RechercherUneEntreprise'

export function createApiEntrepriseLoader(numero?: string): SireneLoader {
  // Déterminer si c'est un RIDET (7 chiffres ou moins) ou un SIRET (14 chiffres)
  const isRidet = Boolean(numero !== undefined && numero.length <= 7)
  
  if (process.env.NODE_ENV === 'development') {
    return isRidet ? new MockRidetLoader() : new MockSireneLoader()
  }
  
  return isRidet ? new RidetApiLoader() : new ApiSireneLoader()
}