import {
  Frais,
  Itinerance,
  ModaliteAcces,
  ModaliteAccompagnement,
  PriseEnChargeSpecifique,
  PublicSpecifiquementAdresse,
  Service,
  Typologie,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'

import {
  fraisAChargeVersEnum,
  itineranceVersEnum,
  modalitesAccesVersEnum,
  modalitesAccompagnementVersEnum,
  priseEnChargeSpecifiqueVersEnum,
  publicsSpecifiquementAdressesVersEnum,
  servicesVersEnum,
  typologiesVersEnum,
  versEnumsLieuInclusion,
} from './lieuInclusionEnums'

describe('conversion des libellés du référentiel vers les enums main', () => {
  it.each([
    {
      attendu: ['SePresenter', 'PasDePublic'],
      champ: 'modalites_acces',
      intention: 'des modalités d’accès, dont le libellé à apostrophe typographique U+2019',
      libelles: ['Se présenter', "Ce lieu n'accueille pas de public"],
      mapping: modalitesAccesVersEnum,
    },
    {
      attendu: ['DansUnAtelierCollectif', 'ADistance'],
      champ: 'modalites_accompagnement',
      intention: 'des modalités d’accompagnement',
      libelles: ['Dans un atelier collectif', 'À distance'],
      mapping: modalitesAccompagnementVersEnum,
    },
    {
      attendu: ['AideAuxDemarchesAdministratives', 'AcquisitionDeMaterielInformatiqueAPrixSolidaire'],
      champ: 'services',
      intention: 'des services',
      libelles: ['Aide aux démarches administratives', 'Acquisition de matériel informatique à prix solidaire'],
      mapping: servicesVersEnum,
    },
    {
      attendu: ['GratuitSousCondition'],
      champ: 'frais_a_charge',
      intention: 'des frais à charge',
      libelles: ['Gratuit sous condition'],
      mapping: fraisAChargeVersEnum,
    },
    {
      attendu: ['Etudiants', 'FamillesEnfants'],
      champ: 'publics_specifiquement_adresses',
      intention: 'des publics spécifiquement adressés',
      libelles: ['Étudiants', 'Familles et/ou enfants'],
      mapping: publicsSpecifiquementAdressesVersEnum,
    },
    {
      attendu: ['LanguesEtrangeresAutre', 'Surdite'],
      champ: 'prise_en_charge_specifique',
      intention: 'des prises en charge spécifiques',
      libelles: ['Langues étrangères (autres)', 'Surdité'],
      mapping: priseEnChargeSpecifiqueVersEnum,
    },
    {
      attendu: ['Itinerant'],
      champ: 'itinerance',
      intention: 'une itinérance',
      libelles: ['Itinérant'],
      mapping: itineranceVersEnum,
    },
    {
      attendu: ['BIB', 'RFS'],
      champ: 'typologies',
      intention: 'des typologies (codes, conversion à l’identité)',
      libelles: ['BIB', 'RFS'],
      mapping: typologiesVersEnum,
    },
  ])(
    'quand je convertis $intention, alors j’obtiens les identifiants d’enum',
    ({ attendu, champ, libelles, mapping }) => {
      // WHEN
      const enums = versEnumsLieuInclusion(libelles, mapping, champ)

      // THEN
      expect(enums).toStrictEqual(attendu)
    }
  )

  it('quand je convertis une valeur hors référentiel, alors une erreur explicite est levée', () => {
    // WHEN
    const conversion = (): ReadonlyArray<string> =>
      versEnumsLieuInclusion(['Se présenter sur place'], modalitesAccesVersEnum, 'modalites_acces')

    // THEN
    expect(conversion).toThrow(
      'Valeur hors référentiel de la médiation numérique pour modalites_acces : « Se présenter sur place »'
    )
  })
})

// Le registre des lieux est partagé avec la Coop, qui le valide avec la bibliothèque du standard
// (#2103). Les nomenclatures que MIN sait écrire doivent être exactement celles du standard :
// ni valeur que le standard refuserait, ni valeur du standard que MIN ne saurait pas écrire.
describe('nomenclatures des lieux, alignées sur le standard', () => {
  it.each([
    { mapping: fraisAChargeVersEnum, nomenclature: 'frais à charge', standard: Frais },
    { mapping: itineranceVersEnum, nomenclature: 'itinérance', standard: Itinerance },
    { mapping: modalitesAccesVersEnum, nomenclature: 'modalités d’accès', standard: ModaliteAcces },
    {
      mapping: modalitesAccompagnementVersEnum,
      nomenclature: 'modalités d’accompagnement',
      standard: ModaliteAccompagnement,
    },
    {
      mapping: priseEnChargeSpecifiqueVersEnum,
      nomenclature: 'prises en charge spécifiques',
      standard: PriseEnChargeSpecifique,
    },
    {
      mapping: publicsSpecifiquementAdressesVersEnum,
      nomenclature: 'publics spécifiquement adressés',
      standard: PublicSpecifiquementAdresse,
    },
    { mapping: servicesVersEnum, nomenclature: 'services', standard: Service },
    { mapping: typologiesVersEnum, nomenclature: 'typologies', standard: Typologie },
  ])('les $nomenclature de MIN sont celles du standard', ({ mapping, standard }) => {
    // GIVEN
    const valeursDuStandard = Object.values<string>(standard).toSorted(parOrdreAlphabetique)

    // WHEN
    const valeursDeMin = Object.keys(mapping).toSorted(parOrdreAlphabetique)

    // THEN
    expect(valeursDeMin).toStrictEqual(valeursDuStandard)
  })
})

function parOrdreAlphabetique(gauche: string, droite: string): number {
  return gauche.localeCompare(droite)
}
