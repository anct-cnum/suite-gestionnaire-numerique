import { CommandHandler, ResultAsync } from '../CommandHandler'
import { ModifierAdresseStructureRepository } from './shared/StructureRepository'
import { BanGeocodingGateway } from '@/gateways/apiBan/BanGeocodingGateway'

export class ModifierAdresseStructure implements CommandHandler<Command> {
  readonly #banGeocodingGateway: BanGeocodingGateway
  readonly #structureRepository: ModifierAdresseStructureRepository

  constructor(banGeocodingGateway: BanGeocodingGateway, structureRepository: ModifierAdresseStructureRepository) {
    this.#banGeocodingGateway = banGeocodingGateway
    this.#structureRepository = structureRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    // La validation des permissions est effectuée au niveau de la Server Action.
    const nomActuel = await this.#structureRepository.lireNomStructure(command.structureId)
    if (nomActuel === null) {
      return 'structureIntrouvable'
    }

    // Règle métier : on ne modifie pas une structure canonique (denomination_antenne null) —
    // ni son nom, ni son adresse. L'édition ne vise que les structures « antenne ».
    if (nomActuel.denominationAntenne === null) {
      return 'structureCanoniqueNonModifiable'
    }

    // On géocode l'adresse saisie via la BAN ; sans correspondance, on refuse.
    const geocode = await this.#banGeocodingGateway.geocoder({ adresse: command.adresse })
    if (geocode === null) {
      return 'adresseIntrouvable'
    }

    // On ne modifie jamais une ligne adresse : le repository réutilise une adresse existante
    // (même clef_interop) ou en crée une nouvelle, puis re-pointe structure.adresse_id.
    await this.#structureRepository.rattacherAdresse(command.structureId, {
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
    })

    return 'OK'
  }
}

export type Failure = 'adresseIntrouvable' | 'structureCanoniqueNonModifiable' | 'structureIntrouvable'

type Command = Readonly<{
  adresse: string
  structureId: number
}>
