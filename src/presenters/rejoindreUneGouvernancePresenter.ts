// eslint-disable-next-line import/no-restricted-paths
import { EntrepriseViewModel } from '@/components/shared/Membre/EntrepriseType'
import { RejoindreUneGouvernanceReadModel } from '@/use-cases/queries/RecupererRejoindreUneGouvernance'

export function rejoindreUneGouvernancePresenter(
  readModel: RejoindreUneGouvernanceReadModel
): RejoindreUneGouvernanceViewModel {
  const { structure } = readModel

  return {
    departements: readModel.departementsDisponibles.map((departement) => ({
      label: `${departement.code} - ${departement.nom}`,
      value: departement.code,
    })),
    entreprise: {
      activitePrincipale: structure.activitePrincipaleCode ?? '',
      activitePrincipaleLibelle: formaterActivitePrincipale(
        structure.activitePrincipaleCode,
        structure.activitePrincipaleLibelle
      ),
      adresse: structure.adresse,
      categorieJuridiqueCode: structure.categorieJuridiqueCode ?? '',
      categorieJuridiqueLibelle: structure.categorieJuridiqueLibelle ?? '-',
      codeInsee: '',
      codePostal: '',
      commune: '',
      denomination: structure.nom,
      identifiant: structure.siret,
      nomVoie: '',
      numeroVoie: '',
    },
  }
}

type RejoindreUneGouvernanceViewModel = Readonly<{
  departements: ReadonlyArray<
    Readonly<{
      label: string
      value: string
    }>
  >
  entreprise: EntrepriseViewModel
}>

function formaterActivitePrincipale(code: null | string, libelle: null | string): string {
  if (libelle !== null && code !== null) {
    return `${libelle} (${code})`
  }

  return libelle ?? code ?? '-'
}
