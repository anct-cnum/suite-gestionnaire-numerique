import { CommandHandler, ResultAsync } from '../CommandHandler'
import { UpdateLieuInclusionInformationsGeneralesRepository } from './shared/LieuInclusionRepository'
import { StructureUid } from '@/domain/Structure'
import { BanGeocodingGateway } from '@/gateways/apiBan/BanGeocodingGateway'

// Deux parcours (#1498) : avec SIRET, les informations proviennent de l'API Entreprise
// (re-résolues côté serveur par la server action), sauf les typologies, saisies depuis
// le référentiel de la médiation numérique ; sans SIRET, tout est saisi manuellement
// et l'adresse est validée via la BAN.
export class ModifierLieuInclusionInformationsGenerales implements CommandHandler<Command> {
  readonly #banGeocodingGateway: BanGeocodingGateway
  readonly #date: Date
  readonly #lieuInclusionRepository: UpdateLieuInclusionInformationsGeneralesRepository

  constructor(
    banGeocodingGateway: BanGeocodingGateway,
    lieuInclusionRepository: UpdateLieuInclusionInformationsGeneralesRepository,
    date: Date
  ) {
    this.#banGeocodingGateway = banGeocodingGateway
    this.#lieuInclusionRepository = lieuInclusionRepository
    this.#date = date
  }

  async handle(command: Command): ResultAsync<Failure> {
    // La validation des permissions est effectuée au niveau de la Server Action.
    if ('avecSiret' in command.modification) {
      return this.#modifierAvecSiret(command.structureId, command.modification.avecSiret)
    }

    return this.#modifierSansSiret(command.structureId, command.modification.sansSiret)
  }

  async #modifierAvecSiret(structureId: string, modification: ModificationAvecSiret): ResultAsync<Failure> {
    // On tente de « banifier » l'adresse INSEE ; sans correspondance BAN, on retombe
    // sur les composants d'adresse SIRENE (sans géométrie).
    const geocode = await this.#banGeocodingGateway.geocoder({
      adresse: modification.entreprise.adresse,
      codeInsee: modification.entreprise.codeInsee,
    })

    await this.#lieuInclusionRepository.updateInformationsGenerales({
      adresseEnrichie: geocode,
      adresseSirene:
        geocode === null
          ? {
              codeInsee: modification.entreprise.codeInsee,
              codePostal: modification.entreprise.codePostal,
              commune: modification.entreprise.commune,
              nomVoie: modification.entreprise.nomVoie,
              numeroVoie: modification.entreprise.numeroVoie === '' ? null : Number(modification.entreprise.numeroVoie),
            }
          : null,
      complementAdresse: null,
      date: this.#date,
      nom: modification.entreprise.denomination,
      siret: modification.siret,
      structureUid: new StructureUid(Number(structureId)),
      typologies: modification.typologies,
    })

    return 'OK'
  }

  async #modifierSansSiret(structureId: string, modification: ModificationSansSiret): ResultAsync<Failure> {
    // On géocode l'adresse saisie via la BAN ; sans correspondance, on refuse.
    const geocode = await this.#banGeocodingGateway.geocoder({ adresse: modification.adresse })
    if (geocode === null) {
      return 'adresseIntrouvable'
    }

    await this.#lieuInclusionRepository.updateInformationsGenerales({
      adresseEnrichie: geocode,
      adresseSirene: null,
      complementAdresse: modification.complementAdresse === '' ? null : modification.complementAdresse,
      date: this.#date,
      itinerance: [modification.itinerant ? 'Itinérant' : 'Fixe'],
      nom: modification.nom,
      siret: null,
      structureUid: new StructureUid(Number(structureId)),
      typologies: modification.typologies,
    })

    return 'OK'
  }
}

export type Failure = 'adresseIntrouvable'

type ModificationAvecSiret = Readonly<{
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

type ModificationSansSiret = Readonly<{
  adresse: string
  complementAdresse: string
  itinerant: boolean
  nom: string
  typologies: ReadonlyArray<string>
}>

type Command = Readonly<{
  modification: Readonly<{ avecSiret: ModificationAvecSiret }> | Readonly<{ sansSiret: ModificationSansSiret }>
  structureId: string
}>
