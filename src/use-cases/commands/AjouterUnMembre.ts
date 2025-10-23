import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { CreateMembreRepository, GetMembreRepository } from './shared/MembreRepository'
import { CreateStructureRepository, GetStructureBySiretRepository } from './shared/StructureRepository'
import { TransactionRepository } from './shared/TransactionRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { GouvernanceUid } from '@/domain/Gouvernance'
import { MembreUid, Statut } from '@/domain/Membre'
import { MembreCandidat } from '@/domain/MembreCandidat'
import { StructureUid } from '@/domain/Structure'
import { BanGeocodingGateway } from '@/gateways/apiBan/BanGeocodingGateway'

export class AjouterUnMembre implements CommandHandler<Command> {
  readonly #banGeocodingGateway: BanGeocodingGateway
  readonly #gouvernanceRepository: GouvernanceRepository
  readonly #membreRepository: MembreRepository
  readonly #structureRepository: StructureRepository
  readonly #transactionRepository: TransactionRepository
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(
    utilisateurRepository: UtilisateurRepository,
    gouvernanceRepository: GouvernanceRepository,
    membreRepository: MembreRepository,
    structureRepository: StructureRepository,
    transactionRepository: TransactionRepository,
    banGeocodingGateway: BanGeocodingGateway
  ) {
    this.#utilisateurRepository = utilisateurRepository
    this.#gouvernanceRepository = gouvernanceRepository
    this.#membreRepository = membreRepository
    this.#structureRepository = structureRepository
    this.#transactionRepository = transactionRepository
    this.#banGeocodingGateway = banGeocodingGateway
  }

  async handle(command: Command): ResultAsync<Failure> {
    const gestionnaire = await this.#utilisateurRepository.get(command.uidGestionnaire)

    const gouvernance = await this.#gouvernanceRepository.get(new GouvernanceUid(command.uidGouvernance))

    if (!gouvernance.peutEtreGereePar(gestionnaire)) {
      return 'gestionnaireNePeutPasAjouterDeMembreDansLaGouvernance'
    }

    // Enrichir l'adresse via l'API BAN avant la transaction
    const adresseEnrichie = await this.#banGeocodingGateway.geocoder({
      adresse: command.entreprise.adresse,
      codeInsee: command.entreprise.codeInsee,
    })

    // Utiliser une transaction pour garantir l'atomicité
    await this.#transactionRepository.transaction(async (tx) => {
      let structureId: number
      // Rechercher une structure existante avec ce SIRET
      const structureExistante = await this.#structureRepository.getBySiret(command.entreprise.siret, tx)

      if (structureExistante) {
        // Structure trouvée, utiliser son ID
        structureId = structureExistante.state.uid.value
      } else {
        // Créer une nouvelle structure dans la transaction avec l'adresse enrichie
        const nouvelleStructure = await this.#structureRepository.create({
          adresse: command.entreprise.adresse,
          adresseEnrichie,
          categorieJuridique: command.entreprise.categorieJuridiqueCode,
          categorieJuridiqueLibelle: command.entreprise.categorieJuridiqueUniteLegale,
          codeInsee: command.entreprise.codeInsee,
          codePostal: command.entreprise.codePostal,
          commune: command.entreprise.commune,
          departementCode: gouvernance.state.departement.code,
          identifiantEtablissement: command.entreprise.siret,
          nom: command.entreprise.nom,
          nomVoie: command.entreprise.nomVoie,
          numeroVoie: command.entreprise.numeroVoie,
        }, tx)
        structureId = nouvelleStructure.state.uid.value
      }

      // Génération d'un UID unique pour le nouveau membre
      const nouveauMembreUid = new MembreUid(crypto.randomUUID())

      // Création d'un membre candidat
      const nouveauMembre = new MembreCandidat(
        nouveauMembreUid,
        command.entreprise.nom,
        new GouvernanceUid(command.uidGouvernance),
        new Statut('candidat'),
        new StructureUid(structureId)
      )

      // Créer le membre dans la même transaction
      await this.#membreRepository.create(
        nouveauMembre,
        command.entreprise,
        command.contact,
        command.contactTechnique,
        tx
      )
    })

    return 'OK'
  }
}

type Failure = 'gestionnaireNePeutPasAjouterDeMembreDansLaGouvernance'

type Command = Readonly<{
  contact: Readonly<{
    email: string
    fonction: string
    nom: string
    prenom: string
  }>
  contactTechnique?: Readonly<{
    email: string
    fonction: string
    nom: string
    prenom: string
  }>
  entreprise: Readonly<{
    adresse: string
    categorieJuridiqueCode: string
    categorieJuridiqueUniteLegale: string
    codeInsee: string
    codePostal: string
    commune: string
    nom: string
    nomVoie: string
    numeroVoie: string
    siret: string
  }>
  uidGestionnaire: string
  uidGouvernance: string
}>

type UtilisateurRepository = GetUtilisateurRepository

type GouvernanceRepository = GetGouvernanceRepository

type MembreRepository = CreateMembreRepository & GetMembreRepository

type StructureRepository = CreateStructureRepository & GetStructureBySiretRepository