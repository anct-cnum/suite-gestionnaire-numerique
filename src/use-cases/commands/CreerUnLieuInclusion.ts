import { CommandHandler, ResultAsync } from '../CommandHandler'
import { AdresseLieuSirene, CreerLieuInclusionRepository } from './shared/LieuInclusionRepository'
import { BanGeocodingGateway } from '@/gateways/apiBan/BanGeocodingGateway'

// Création d'un lieu (#1495, mêmes règles que la modification #1498). Formulaire unique :
// tous les champs sont saisis, le SIRET n'étant qu'un accélérateur de remplissage. Un lieu
// sans adresse est refusé : il ne serait ni cartographiable ni dédoublonnable. Seule
// exception, l'adresse reprise telle quelle d'un SIRET peut retomber sur les composants
// SIRENE quand la BAN ne la reconnaît pas.
export class CreerUnLieuInclusion implements CommandHandler<Command, Failure, Succes> {
  readonly #banGeocodingGateway: BanGeocodingGateway
  readonly #date: Date
  readonly #lieuInclusionRepository: CreerLieuInclusionRepository

  constructor(
    banGeocodingGateway: BanGeocodingGateway,
    lieuInclusionRepository: CreerLieuInclusionRepository,
    date: Date
  ) {
    this.#banGeocodingGateway = banGeocodingGateway
    this.#lieuInclusionRepository = lieuInclusionRepository
    this.#date = date
  }

  async handle(command: Command): ResultAsync<Failure, Succes> {
    // La validation des permissions est effectuée au niveau de la Server Action.
    const { creation, visiblePourCartographie } = command
    const { repliSirene } = creation

    // L'adresse n'est reconnue comme venant du SIRET que si l'utilisateur ne l'a pas
    // retouchée : son code INSEE aide alors le géocodage, et ses composants servent de repli.
    const repliApplicable = repliSirene !== null && repliSirene.adresse === creation.adresse ? repliSirene : null

    const geocode = await this.#banGeocodingGateway.geocoder(
      repliApplicable === null
        ? { adresse: creation.adresse }
        : { adresse: creation.adresse, codeInsee: repliApplicable.codeInsee }
    )
    const adresseSirene = geocode === null && repliApplicable !== null ? adresseSireneComplete(repliApplicable) : null

    if (geocode === null && adresseSirene === null) {
      return 'adresseIntrouvable'
    }

    // Règle Coop : sans identifiant BAN, un lieu n'est plus partageable avec la
    // cartographie nationale, quel que soit le choix saisi dans le formulaire.
    const visibilitePourCartographieForcee = geocode === null && visiblePourCartographie

    const lieuId = await this.#lieuInclusionRepository.creer({
      adresseEnrichie: geocode,
      adresseSirene,
      complementAdresse: creation.complementAdresse === '' ? null : creation.complementAdresse,
      date: this.#date,
      itinerance: [creation.itinerant ? 'Itinérant' : 'Fixe'],
      nom: creation.nom,
      siret: creation.siret,
      typologies: creation.typologies,
      visiblePourCartographie: geocode === null ? false : visiblePourCartographie,
    })

    return { lieuId, visibilitePourCartographieForcee }
  }
}

export type Failure = 'adresseIntrouvable'

type Succes = Readonly<{ lieuId: number; visibilitePourCartographieForcee: boolean }>

// Repli sans géométrie sur les composants SIRENE, seulement s'ils suffisent à
// localiser le lieu (code INSEE, code postal, commune).
function adresseSireneComplete(repliSirene: RepliSirene): AdresseLieuSirene | null {
  if (repliSirene.codeInsee === '' || repliSirene.codePostal === '' || repliSirene.commune === '') {
    return null
  }

  return {
    codeInsee: repliSirene.codeInsee,
    codePostal: repliSirene.codePostal,
    commune: repliSirene.commune,
    nomVoie: repliSirene.nomVoie,
    numeroVoie: repliSirene.numeroVoie === '' ? null : Number(repliSirene.numeroVoie),
  }
}

// Informations d'adresse du SIRET résolu côté serveur, conservées pour le seul cas où
// l'utilisateur soumet l'adresse pré-remplie sans la modifier.
type RepliSirene = Readonly<{
  adresse: string
  codeInsee: string
  codePostal: string
  commune: string
  nomVoie: string
  numeroVoie: string
}>

type Creation = Readonly<{
  adresse: string
  complementAdresse: string
  itinerant: boolean
  nom: string
  repliSirene: null | RepliSirene
  siret: null | string
  typologies: ReadonlyArray<string>
}>

type Command = Readonly<{
  creation: Creation
  visiblePourCartographie: boolean
}>
