import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { CreateMembreRepository } from './shared/MembreRepository'
import { TransactionRepository } from './shared/TransactionRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { GouvernanceUid } from '@/domain/Gouvernance'
import { MembreUid, Statut } from '@/domain/Membre'
import { MembreCandidat } from '@/domain/MembreCandidat'
import { StructureUid } from '@/domain/Structure'

export class RejoindreUneGouvernance implements CommandHandler<Command> {
  readonly #gouvernanceRepository: GouvernanceRepository
  readonly #membreExistantLoader: MembreExistantLoader
  readonly #membreRepository: MembreRepository
  readonly #structureCandidatureLoader: StructureCandidatureLoader
  readonly #transactionRepository: TransactionRepository
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(
    utilisateurRepository: UtilisateurRepository,
    gouvernanceRepository: GouvernanceRepository,
    membreRepository: MembreRepository,
    membreExistantLoader: MembreExistantLoader,
    structureCandidatureLoader: StructureCandidatureLoader,
    transactionRepository: TransactionRepository
  ) {
    this.#utilisateurRepository = utilisateurRepository
    this.#gouvernanceRepository = gouvernanceRepository
    this.#membreRepository = membreRepository
    this.#membreExistantLoader = membreExistantLoader
    this.#structureCandidatureLoader = structureCandidatureLoader
    this.#transactionRepository = transactionRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    const utilisateur = await this.#utilisateurRepository.get(command.uidUtilisateur)

    const structureUid = utilisateur.state.structureUid
    if (structureUid === undefined) {
      return 'utilisateurSansStructure'
    }

    const gouvernance = await this.#gouvernanceRepository.get(new GouvernanceUid(command.codeDepartement))

    const estDejaMembre = await this.#membreExistantLoader.existePourStructureDansGouvernance(
      structureUid.value,
      gouvernance.state.uid.value
    )
    if (estDejaMembre) {
      return 'structureDejaMembreDeLaGouvernance'
    }

    const structure = await this.#structureCandidatureLoader.get(structureUid.value)

    const nouveauMembre = new MembreCandidat(
      new MembreUid(crypto.randomUUID()),
      structure.nom,
      new GouvernanceUid(command.codeDepartement),
      new Statut('candidat'),
      new StructureUid(structureUid.value)
    )

    await this.#transactionRepository.transaction(async (tx) => {
      await this.#membreRepository.create(
        nouveauMembre,
        {
          categorieJuridiqueCode: structure.categorieJuridiqueCode,
          categorieJuridiqueUniteLegale: structure.categorieJuridiqueLibelle,
          siret: structure.siret,
        },
        command.contact,
        command.contactTechnique,
        tx
      )
    })

    return 'OK'
  }
}

export interface MembreExistantLoader {
  existePourStructureDansGouvernance(structureId: number, codeDepartement: string): Promise<boolean>
}

export interface StructureCandidatureLoader {
  get(structureId: number): Promise<StructureCandidature>
}

export type StructureCandidature = Readonly<{
  categorieJuridiqueCode: string
  categorieJuridiqueLibelle: string
  nom: string
  siret: string
}>

type Failure = 'structureDejaMembreDeLaGouvernance' | 'utilisateurSansStructure'

type Command = Readonly<{
  codeDepartement: string
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
  uidUtilisateur: string
}>

type UtilisateurRepository = GetUtilisateurRepository

type GouvernanceRepository = GetGouvernanceRepository

type MembreRepository = CreateMembreRepository
