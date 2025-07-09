import { SireneApiLoader } from '../SireneApiLoader'
import { SireneMockLoader } from '../SireneMockLoader'
import { SireneLoader } from '@/use-cases/queries/RechercherUneEntreprise'

export function createSireneLoader(): SireneLoader {
  if (process.env.NODE_ENV === 'development') {
    return new SireneMockLoader()
  }
  
  return new SireneApiLoader()
}