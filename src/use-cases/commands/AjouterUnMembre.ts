import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { CreateMembreRepository, GetMembreRepository } from './shared/MembreRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { GouvernanceUid } from '@/domain/Gouvernance'
import { MembreUid, Statut } from '@/domain/Membre'
import { MembreCandidat } from '@/domain/MembreCandidat'

export class AjouterUnMembre implements CommandHandler<Command> {
  readonly #gouvernanceRepository: GouvernanceRepository
  readonly #membreRepository: MembreRepository
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(
    utilisateurRepository: UtilisateurRepository,
    gouvernanceRepository: GouvernanceRepository,
    membreRepository: MembreRepository
  ) {
    this.#utilisateurRepository = utilisateurRepository
    this.#gouvernanceRepository = gouvernanceRepository
    this.#membreRepository = membreRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    const gestionnaire = await this.#utilisateurRepository.get(command.uidGestionnaire)

    const gouvernance = await this.#gouvernanceRepository.get(new GouvernanceUid(command.uidGouvernance))

    if (!gouvernance.peutEtreGereePar(gestionnaire)) {
      return 'gestionnaireNePeutPasAjouterDeMembreDansLaGouvernance'
    }

    // Génération d'un UID unique pour le nouveau membre
    const nouveauMembreUid = new MembreUid(crypto.randomUUID())

    // Création d'un membre candidat avec le rôle observateur par défaut
    const nouveauMembre = new MembreCandidat(
      nouveauMembreUid,
      command.nomEntreprise,
      new GouvernanceUid(command.uidGouvernance),
      new Statut('candidat')
    )

    await this.#membreRepository.create(nouveauMembre, command.contact, command.contactTechnique, command.entreprise)

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
  entreprise?: Readonly<{
    categorieJuridiqueUniteLegale: string
  }>
  nomEntreprise: string
  uidGestionnaire: string
  uidGouvernance: string
}>

type UtilisateurRepository = GetUtilisateurRepository

type GouvernanceRepository = GetGouvernanceRepository

type MembreRepository = CreateMembreRepository & GetMembreRepository