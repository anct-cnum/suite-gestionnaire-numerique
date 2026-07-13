import { formaterEnDateFrancaise } from '@/presenters/shared/date'
import { CouleurFraicheur, couleurFraicheur, libellesFraicheur } from '@/presenters/shared/fraicheur'
import { LieuDetailsReadModel } from '@/use-cases/queries/RecupererLieuDetails'

export function lieuDetailsPresenter(
  lieuDetailsReadModel: LieuDetailsReadModel,
  peutModifier: boolean,
  now: Date
): LieuInclusionDetailsData {
  return {
    header: {
      fraicheur: getFraicheur(lieuDetailsReadModel.header, now),
      nom: lieuDetailsReadModel.header.nom,
      tags: lieuDetailsReadModel.header.tags,
    },
    informationsGenerales: {
      adresse: lieuDetailsReadModel.informationsGenerales.adresse,
      complementAdresse: lieuDetailsReadModel.informationsGenerales.complementAdresse,
      nomStructure: lieuDetailsReadModel.informationsGenerales.nomStructure,
      siret: lieuDetailsReadModel.informationsGenerales.siret,
    },
    lieuAccueilPublic: {
      accessibilite: lieuDetailsReadModel.lieuAccueilPublic.accessibilite,
      conseillerNumeriqueLabellePhase2: lieuDetailsReadModel.lieuAccueilPublic.conseillerNumeriqueLabellePhase2,
      conseillerNumeriqueLabellePhase3: lieuDetailsReadModel.lieuAccueilPublic.conseillerNumeriqueLabellePhase3,
      email: lieuDetailsReadModel.lieuAccueilPublic.email,
      fraisACharge: lieuDetailsReadModel.lieuAccueilPublic.fraisACharge,
      horaires: lieuDetailsReadModel.lieuAccueilPublic.horaires,
      itinerance: lieuDetailsReadModel.lieuAccueilPublic.itinerance,
      modalitesAcces: lieuDetailsReadModel.lieuAccueilPublic.modalitesAcces,
      modalitesAccueil: lieuDetailsReadModel.lieuAccueilPublic.modalitesAccueil,
      presentationDetail: lieuDetailsReadModel.lieuAccueilPublic.presentationDetail,
      presentationResume: lieuDetailsReadModel.lieuAccueilPublic.presentationResume,
      priseEnChargeSpecifique: lieuDetailsReadModel.lieuAccueilPublic.priseEnChargeSpecifique,
      priseRdvUrl: lieuDetailsReadModel.lieuAccueilPublic.priseRdvUrl,
      publicsSpecifiquementAdresses: lieuDetailsReadModel.lieuAccueilPublic.publicsSpecifiquementAdresses,
      telephone: lieuDetailsReadModel.lieuAccueilPublic.telephone,
      typologies: lieuDetailsReadModel.lieuAccueilPublic.typologies,
      websiteUrl: lieuDetailsReadModel.lieuAccueilPublic.websiteUrl,
    },
    personnesTravaillant: lieuDetailsReadModel.personnesTravaillant,
    peutModifier,
    servicesInclusionNumerique: lieuDetailsReadModel.servicesInclusionNumerique,
  }
}

function getFraicheur(
  header: LieuDetailsReadModel['header'],
  now: Date
): LieuInclusionDetailsData['header']['fraicheur'] {
  if (header.miseAJourLe === undefined) {
    return undefined
  }

  const couleur = couleurFraicheur(header.miseAJourLe, now)

  return {
    couleur,
    date: formaterEnDateFrancaise(header.miseAJourLe),
    libelle: libellesFraicheur[couleur],
    source: (header.editeur === undefined ? undefined : nomApplicationParEditeur[header.editeur]) ?? '-',
  }
}

// Nom d'application affiché « Via … » selon l'éditeur (edited_by) de la
// dernière modification ; un tiret est affiché quand l'éditeur est inconnu.
const nomApplicationParEditeur: Readonly<Record<string, string | undefined>> = {
  'aidants-connect': 'Aidants Connect',
  carto: 'la Cartographie nationale',
  coop: 'la Coop',
  min_scalingo: 'Mon Inclusion Numérique',
  sonum: 'Mon Inclusion Numérique',
}

interface LieuInclusionDetailsData {
  header: {
    fraicheur?: {
      couleur: CouleurFraicheur
      date: string
      libelle: string
      source: string
    }
    nom: string
    tags: ReadonlyArray<string>
  }
  informationsGenerales: {
    adresse: string
    complementAdresse?: string
    nomStructure: string
    siret?: string
  }
  lieuAccueilPublic: {
    accessibilite?: string
    conseillerNumeriqueLabellePhase2?: boolean
    conseillerNumeriqueLabellePhase3?: boolean
    email?: string
    fraisACharge?: ReadonlyArray<string>
    horaires?: string
    itinerance?: ReadonlyArray<string>
    modalitesAcces?: ReadonlyArray<string>
    modalitesAccueil?: string
    presentationDetail?: string
    presentationResume?: string
    priseEnChargeSpecifique?: ReadonlyArray<string>
    priseRdvUrl?: string
    publicsSpecifiquementAdresses?: ReadonlyArray<string>
    telephone?: string
    typologies?: ReadonlyArray<string>
    websiteUrl?: string
  }
  personnesTravaillant: ReadonlyArray<{
    email?: string
    id: number
    labelisations: ReadonlyArray<'aidants connect' | 'conseiller numérique'>
    nom: string
    prenom: string
    role?: string
    telephone?: string
  }>
  peutModifier: boolean
  servicesInclusionNumerique: ReadonlyArray<{
    description?: string
    modalites: ReadonlyArray<string>
    nom: string
    thematiques: ReadonlyArray<string>
  }>
}
