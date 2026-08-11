import { CommandHandler, ResultAsync } from '../CommandHandler'
import { MettreAJourStructureDepuisEntrepriseRepository } from './shared/StructureRepository'
import { BanGeocodingGateway } from '@/gateways/apiBan/BanGeocodingGateway'

export class MettreAJourStructureDepuisEntreprise implements CommandHandler<Command> {
  readonly #banGeocodingGateway: BanGeocodingGateway
  readonly #structureRepository: MettreAJourStructureDepuisEntrepriseRepository

  constructor(
    banGeocodingGateway: BanGeocodingGateway,
    structureRepository: MettreAJourStructureDepuisEntrepriseRepository
  ) {
    this.#banGeocodingGateway = banGeocodingGateway
    this.#structureRepository = structureRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    // La validation des permissions est effectuée au niveau de la Server Action.
    const structureExiste = await this.#structureRepository.structureExiste(command.structureId)
    if (!structureExiste) {
      return 'structureIntrouvable'
    }

    // Contrairement à ModifierAdresseStructure, les structures canoniques sont modifiables :
    // le parcours de labellisation met à jour les données légales officielles (API Entreprise),
    // qui font foi — la règle « antenne uniquement » ne concerne que l'édition admin.
    // On géocode l'adresse officielle via la BAN ; sans correspondance, on refuse.
    const geocode = await this.#banGeocodingGateway.geocoder({ adresse: command.adresse })
    if (geocode === null) {
      return 'adresseIntrouvable'
    }

    await this.#structureRepository.mettreAJourDepuisEntreprise(
      command.structureId,
      {
        categorieJuridique: command.categorieJuridique,
        codeActivitePrincipale: command.codeActivitePrincipale,
        denominationSirene: command.denominationSirene,
        siret: command.siret,
      },
      {
        clefInterop: geocode.banClefInterop,
        codeBan: geocode.banCodeBan,
        codeInsee: geocode.banCodeInsee,
        codePostal: geocode.banCodePostal,
        latitude: geocode.banLatitude,
        longitude: geocode.banLongitude,
        nomCommune: geocode.banNomCommune,
        nomVoie: geocode.banNomVoie,
        numeroVoie: geocode.banNumeroVoie,
        repetition: geocode.banRepetition,
      }
    )

    return 'OK'
  }
}

export type Failure = 'adresseIntrouvable' | 'structureIntrouvable'

type Command = Readonly<{
  adresse: string
  categorieJuridique: string
  codeActivitePrincipale: string
  denominationSirene: string
  siret: string
  structureId: number
}>
