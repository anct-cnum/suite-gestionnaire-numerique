import { SireneEtablissement } from './sirene/types'
import { EntrepriseSirene } from '@/components/GestionMembresGouvernance/types'

export function transformerEtablissementSirene(etablissement: SireneEtablissement): EntrepriseSirene {
  const uniteLegale = etablissement.uniteLegale
  
  // Construction de l'adresse complète (format INSEE)
  const adresseEtab = etablissement.adresseEtablissement
  const adresseElements = [
    adresseEtab.complementAdresseEtablissement,
    adresseEtab.numeroVoieEtablissement,
    adresseEtab.typeVoieEtablissement,
    adresseEtab.libelleVoieEtablissement,
  ].filter(Boolean)
  
  const adresseComplete = [
    adresseElements.join(' '),
    adresseEtab.codePostalEtablissement,
    adresseEtab.libelleCommuneEtablissement,
  ].filter(Boolean).join(', ')

  // Récupération de la dénomination (priorité : dénomination > nom > enseigne)
  const periodeActuelle = etablissement.periodesEtablissement[0]
  const denominationUniteLegale = 
    uniteLegale.denominationUniteLegale ??
    uniteLegale.nomUniteLegale ??
    periodeActuelle.enseigne1Etablissement ??
    'Dénomination non renseignée'

  return {
    activitePrincipaleUniteLegale: uniteLegale.activitePrincipaleUniteLegale,
    adresseComplete,
    categorieJuridiqueUniteLegale: uniteLegale.categorieJuridiqueUniteLegale,
    codePostal: adresseEtab.codePostalEtablissement ?? '',
    denominationUniteLegale,
    libelleCommuneEtablissement: adresseEtab.libelleCommuneEtablissement ?? '',
    siret: etablissement.siret,
  }
}