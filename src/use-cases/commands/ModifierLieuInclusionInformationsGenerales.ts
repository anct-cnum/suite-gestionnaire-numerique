import { CommandHandler, ResultAsync } from '../CommandHandler'
import { AdresseLieuSirene, UpdateLieuInclusionInformationsGeneralesRepository } from './shared/LieuInclusionRepository'
import { StructureUid } from '@/domain/Structure'
import { BanGeocodingGateway } from '@/gateways/apiBan/BanGeocodingGateway'

// Modification des informations générales d'un lieu (#1498). Même formulaire que la
// création (#1495) : tous les champs sont saisis, le SIRET n'étant qu'un accélérateur de
// remplissage. L'adresse est validée par la BAN ; seule celle reprise telle quelle d'un
// SIRET peut retomber sur les composants SIRENE quand la BAN ne la reconnaît pas.
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
    const { modification } = command
    const { repliSirene } = modification

    // L'adresse n'est reconnue comme venant du SIRET que si l'utilisateur ne l'a pas
    // retouchée : son code INSEE aide alors le géocodage, et ses composants servent de repli.
    const repliApplicable = repliSirene !== null && repliSirene.adresse === modification.adresse ? repliSirene : null

    const geocode = await this.#banGeocodingGateway.geocoder(
      repliApplicable === null
        ? { adresse: modification.adresse }
        : { adresse: modification.adresse, codeInsee: repliApplicable.codeInsee }
    )
    const adresseSirene = geocode === null && repliApplicable !== null ? adresseSireneComplete(repliApplicable) : null

    if (geocode === null && adresseSirene === null) {
      return 'adresseIntrouvable'
    }

    await this.#lieuInclusionRepository.updateInformationsGenerales({
      adresseEnrichie: geocode,
      adresseSirene,
      complementAdresse: modification.complementAdresse === '' ? null : modification.complementAdresse,
      date: this.#date,
      itinerance: [modification.itinerant ? 'Itinérant' : 'Fixe'],
      nom: modification.nom,
      siret: modification.siret,
      structureUid: new StructureUid(Number(command.structureId)),
      typologies: modification.typologies,
    })

    return 'OK'
  }
}

export type Failure = 'adresseIntrouvable'

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

type Modification = Readonly<{
  adresse: string
  complementAdresse: string
  itinerant: boolean
  nom: string
  repliSirene: null | RepliSirene
  siret: null | string
  typologies: ReadonlyArray<string>
}>

type Command = Readonly<{
  modification: Modification
  structureId: string
}>
