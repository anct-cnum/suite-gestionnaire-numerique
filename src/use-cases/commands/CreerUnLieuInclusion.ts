import { CommandHandler, ResultAsync } from '../CommandHandler'
import { AdresseLieuSirene, CreerLieuInclusionRepository } from './shared/LieuInclusionRepository'
import { BanGeocodingGateway } from '@/gateways/apiBan/BanGeocodingGateway'

// Deux parcours (#1495, mêmes règles que la modification #1498) : avec SIRET, les
// informations proviennent de l'API Entreprise (re-résolues côté serveur par la server
// action), sauf les typologies, saisies depuis le référentiel ; sans SIRET, tout est
// saisi manuellement. Dans les deux cas, un lieu sans adresse est refusé : il ne serait
// ni cartographiable ni dédoublonnable.
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
    if ('avecSiret' in command.creation) {
      return this.#creerAvecSiret(command.creation.avecSiret, command.visiblePourCartographie)
    }

    return this.#creerSansSiret(command.creation.sansSiret, command.visiblePourCartographie)
  }

  async #creerAvecSiret(creation: CreationAvecSiret, visiblePourCartographie: boolean): ResultAsync<Failure, Succes> {
    const { entreprise } = creation
    const geocode = await this.#banGeocodingGateway.geocoder({
      adresse: entreprise.adresse,
      codeInsee: entreprise.codeInsee,
    })
    const adresseSirene = geocode === null ? adresseSireneComplete(entreprise) : null

    if (geocode === null && adresseSirene === null) {
      return 'adresseIntrouvable'
    }

    // Règle Coop : sans identifiant BAN, un lieu n'est plus partageable avec la
    // cartographie nationale, quel que soit le choix saisi dans le formulaire.
    const visibilitePourCartographieForcee = geocode === null && visiblePourCartographie

    const lieuId = await this.#lieuInclusionRepository.creer({
      adresseEnrichie: geocode,
      adresseSirene,
      complementAdresse: null,
      date: this.#date,
      itinerance: ['Fixe'],
      nom: entreprise.denomination,
      siret: creation.siret,
      typologies: creation.typologies,
      visiblePourCartographie: geocode === null ? false : visiblePourCartographie,
    })

    return { lieuId, visibilitePourCartographieForcee }
  }

  async #creerSansSiret(creation: CreationSansSiret, visiblePourCartographie: boolean): ResultAsync<Failure, Succes> {
    const geocode = await this.#banGeocodingGateway.geocoder({ adresse: creation.adresse })
    if (geocode === null) {
      return 'adresseIntrouvable'
    }

    const lieuId = await this.#lieuInclusionRepository.creer({
      adresseEnrichie: geocode,
      adresseSirene: null,
      complementAdresse: creation.complementAdresse === '' ? null : creation.complementAdresse,
      date: this.#date,
      itinerance: [creation.itinerant ? 'Itinérant' : 'Fixe'],
      nom: creation.nom,
      siret: null,
      typologies: creation.typologies,
      visiblePourCartographie,
    })

    return { lieuId, visibilitePourCartographieForcee: false }
  }
}

export type Failure = 'adresseIntrouvable'

type Succes = Readonly<{ lieuId: number; visibilitePourCartographieForcee: boolean }>

// Repli sans géométrie sur les composants SIRENE, seulement s'ils suffisent à
// localiser le lieu (code INSEE, code postal, commune).
function adresseSireneComplete(entreprise: CreationAvecSiret['entreprise']): AdresseLieuSirene | null {
  if (entreprise.codeInsee === '' || entreprise.codePostal === '' || entreprise.commune === '') {
    return null
  }

  return {
    codeInsee: entreprise.codeInsee,
    codePostal: entreprise.codePostal,
    commune: entreprise.commune,
    nomVoie: entreprise.nomVoie,
    numeroVoie: entreprise.numeroVoie === '' ? null : Number(entreprise.numeroVoie),
  }
}

type CreationAvecSiret = Readonly<{
  entreprise: Readonly<{
    adresse: string
    codeInsee: string
    codePostal: string
    commune: string
    denomination: string
    nomVoie: string
    numeroVoie: string
  }>
  siret: string
  typologies: ReadonlyArray<string>
}>

type CreationSansSiret = Readonly<{
  adresse: string
  complementAdresse: string
  itinerant: boolean
  nom: string
  typologies: ReadonlyArray<string>
}>

type Command = Readonly<{
  creation: Readonly<{ avecSiret: CreationAvecSiret }> | Readonly<{ sansSiret: CreationSansSiret }>
  visiblePourCartographie: boolean
}>
