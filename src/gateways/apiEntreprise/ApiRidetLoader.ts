import { EntrepriseNonTrouvee, EntrepriseReadModel, SireneLoader } from '@/use-cases/queries/RechercherUneEntreprise'

export class RidetApiLoader implements SireneLoader {
  static transformerEtablissementRidet(
    etablissement: RidetEtablissement,
    ridetOriginal?: string
  ): EntrepriseReadModel {
    // Construire l'adresse à partir des informations disponibles
    const adresseComplete = `${etablissement.libelle_commune}, ${etablissement.province}`.toUpperCase()

    // Format: "code - libellé" pour être cohérent avec SIRENE
    const activitePrincipaleFormatted = `${etablissement.code_ape} - ${etablissement.libelle_naf}`

    return {
      activitePrincipale: activitePrincipaleFormatted,
      adresse: adresseComplete,
      categorieJuridiqueCode: etablissement.code_formjur,
      categorieJuridiqueLibelle: etablissement.libelle_formjur,
      codeInsee: etablissement.code_commune,
      codePostal: '', // Pas disponible dans l'API RIDET
      commune: etablissement.libelle_commune,
      denomination: etablissement.denomination,
      identifiant: ridetOriginal ?? etablissement.rid7,
      nomVoie: '', // Pas disponible dans l'API RIDET
      numeroVoie: '', // Pas disponible dans l'API RIDET
    }
  }

  async rechercherParIdentifiant(numeroRidet: string): Promise<EntrepriseNonTrouvee | EntrepriseReadModel> {
    const ridetPadded = numeroRidet.padStart(7, '0')

    const params = new URLSearchParams({
      limit: '1',
      where: `rid7='${ridetPadded}'`,
    })

    const url = `https://data.gouv.nc/api/explore/v2.1/catalog/datasets/entreprises-actives-au-ridet/records?${params}`

    try {
      const response = await fetch(url)

      if (!response.ok) {
        return { estTrouvee: false }
      }

      const data = await response.json() as { results: Array<RidetEtablissement> }

      if (data.results.length === 0) {
        return { estTrouvee: false }
      }

      const etablissement = data.results[0]
      const entreprise = RidetApiLoader.transformerEtablissementRidet(etablissement, numeroRidet)

      return entreprise
    } catch {
      return { estTrouvee: false }
    }
  }
}

// Types pour l'API RIDET de Nouvelle-Calédonie
// Documentation : https://data.gouv.nc/
type RidetEtablissement = Readonly<{
  code_ape: string
  code_commune: string
  code_formjur: string
  date_emploi: string
  date_entreprise_active: string
  denomination: string
  division_naf: string
  hors_nc: null | string
  libelle_commune: string
  libelle_division_naf: string
  libelle_formjur: string
  libelle_naf: string
  libelle_section_naf: string
  province: string
  rid7: string
  salaries: string
  section_naf: string
}>
