import {
  main_frais_a_charge,
  main_itinerance,
  main_modalite_acces,
  main_modalite_accompagnement,
  main_prise_en_charge_specifique,
  main_public_specifiquement_adresse,
  main_service,
  main_typologie,
} from '@prisma/client'

// Intégration coop 2026 (#1700, dataspace V122) : les colonnes métier de
// main.lieu_inclusion sont typées enum en base ; le client Prisma manipule les
// identifiants d'enum (ex. AideAuxDemarchesAdministratives) tandis que le reste
// de MIN (use cases, formulaires, $queryRaw) manipule les libellés français du
// référentiel des lieux de médiation numérique. Ces tables font la conversion
// libellé → enum à la frontière Prisma, uniquement pour les écritures.
// Une valeur hors référentiel est une erreur (fail-fast), pas une donnée.

export function versEnumsLieuInclusion<T extends string>(
  valeurs: ReadonlyArray<string>,
  mapping: Readonly<Record<string, T>>,
  champ: string
): Array<T> {
  return valeurs.map((valeur) => {
    const enumValue = mapping[valeur] as T | undefined
    if (enumValue === undefined) {
      throw new Error(`Valeur hors référentiel de la médiation numérique pour ${champ} : « ${valeur} »`)
    }
    return enumValue
  })
}

export const fraisAChargeVersEnum: Readonly<Record<string, main_frais_a_charge>> = {
  Gratuit: main_frais_a_charge.Gratuit,
  'Gratuit sous condition': main_frais_a_charge.GratuitSousCondition,
  Payant: main_frais_a_charge.Payant,
}

export const itineranceVersEnum: Readonly<Record<string, main_itinerance>> = {
  Fixe: main_itinerance.Fixe,
  Itinérant: main_itinerance.Itinerant,
}

export const modalitesAccesVersEnum: Readonly<Record<string, main_modalite_acces>> = {
  'Ce lieu n’accueille pas de public': main_modalite_acces.PasDePublic,
  'Contacter par mail': main_modalite_acces.ContacterParMail,
  'Envoyer un mail avec une fiche de prescription': main_modalite_acces.FicheDePrescription,
  'Prendre un RDV en ligne': main_modalite_acces.PrendreRdvEnLigne,
  'Se présenter': main_modalite_acces.SePresenter,
  Téléphoner: main_modalite_acces.Telephoner,
}

export const modalitesAccompagnementVersEnum: Readonly<Record<string, main_modalite_accompagnement>> = {
  'Accompagnement individuel': main_modalite_accompagnement.AccompagnementIndividuel,
  'À distance': main_modalite_accompagnement.ADistance,
  // eslint-disable-next-line sort-keys -- sort-keys and perfectionist use different sorting for accents
  'Dans un atelier collectif': main_modalite_accompagnement.DansUnAtelierCollectif,
  'En autonomie': main_modalite_accompagnement.EnAutonomie,
}

export const priseEnChargeSpecifiqueVersEnum: Readonly<Record<string, main_prise_en_charge_specifique>> = {
  'Déficience visuelle': main_prise_en_charge_specifique.DeficienceVisuelle,
  'Handicaps mentaux': main_prise_en_charge_specifique.HandicapsMentaux,
  'Handicaps moteurs': main_prise_en_charge_specifique.HandicapsMoteurs,
  Illettrisme: main_prise_en_charge_specifique.Illettrisme,
  'Langues étrangères (anglais)': main_prise_en_charge_specifique.LanguesEtrangeresAnglais,
  'Langues étrangères (autres)': main_prise_en_charge_specifique.LanguesEtrangeresAutre,
  Surdité: main_prise_en_charge_specifique.Surdite,
}

export const publicsSpecifiquementAdressesVersEnum: Readonly<Record<string, main_public_specifiquement_adresse>> = {
  Étudiants: main_public_specifiquement_adresse.Etudiants,
  // eslint-disable-next-line sort-keys -- sort-keys and perfectionist use different sorting for accents
  'Familles et/ou enfants': main_public_specifiquement_adresse.FamillesEnfants,
  Femmes: main_public_specifiquement_adresse.Femmes,
  Jeunes: main_public_specifiquement_adresse.Jeunes,
  Seniors: main_public_specifiquement_adresse.Seniors,
}

export const servicesVersEnum: Readonly<Record<string, main_service>> = {
  'Accès internet et matériel informatique': main_service.AccesInternetEtMaterielInformatique,
  'Acquisition de matériel informatique à prix solidaire': main_service.AcquisitionDeMaterielInformatiqueAPrixSolidaire,
  'Aide aux démarches administratives': main_service.AideAuxDemarchesAdministratives,
  'Compréhension du monde numérique': main_service.ComprehensionDuMondeNumerique,
  'Insertion professionnelle via le numérique': main_service.InsertionProfessionnelleViaLeNumerique,
  'Loisirs et créations numériques': main_service.LoisirsEtCreationsNumeriques,
  'Maîtrise des outils numériques du quotidien': main_service.MaitriseDesOutilsNumeriquesDuQuotidien,
  'Parentalité et éducation avec le numérique': main_service.ParentaliteEtEducationAvecLeNumerique,
  'Utilisation sécurisée du numérique': main_service.UtilisationSecuriseeDuNumerique,
}

// Les typologies sont des codes (BIB, RFS…) : identifiant d'enum = valeur en
// base, l'objet généré par Prisma sert directement de table de conversion.
export const typologiesVersEnum: Readonly<Record<string, main_typologie>> = main_typologie
