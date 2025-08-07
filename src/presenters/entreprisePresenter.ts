// eslint-disable-next-line import/no-restricted-paths
import { EntrepriseViewModel } from '@/components/shared/Membre/EntrepriseType'
import { EntrepriseReadModel } from '@/use-cases/queries/RechercherUneEntreprise'

export function entreprisePresenter(readModel: EntrepriseReadModel): EntrepriseViewModel {
  return {
    activitePrincipale: readModel.activitePrincipale,
    activitePrincipaleLibelle: readModel.activitePrincipaleLibelle ?? `Code NAF ${readModel.activitePrincipale}`,
    adresse: readModel.adresse,
    categorieJuridiqueCode: readModel.categorieJuridiqueCode,
    categorieJuridiqueLibelle: readModel.categorieJuridiqueLibelle ?? `Code ${readModel.categorieJuridiqueCode}`,
    denomination: readModel.denomination,
    identifiant: readModel.identifiant,
  }
}

