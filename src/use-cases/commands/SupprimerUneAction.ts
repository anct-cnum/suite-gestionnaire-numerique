import { CommandHandler, ResultAsync } from '../CommandHandler'
import { PrismaUneActionLoader } from '@/gateways/PrismaUneActionLoader'

export class SupprimerUneAction implements CommandHandler<Command> {
  #actionLoader: PrismaUneActionLoader
  constructor(
    actionLoader: PrismaUneActionLoader,
  ) {
    this.#actionLoader = actionLoader
  }

  async handle(command: Command): ResultAsync<Failure> {
    const action = await this.#actionLoader.get(command.uidAction)
    if (action.demandeDeSubvention === undefined ||
    action.demandeDeSubvention.statut === "" ) {
      return 'suppressionActionNonAutorisee'
    }
    // if (!feuilleDeRoute.peutEtreGereePar(gestionnaire)) {
    //   return 'suppressionActionNonAutorisee'
    // }
    // if (demandesDeSubvention.estUneDemandeSubventionEnCoursOuClos()) {
    //   return 'conflitExisteSubventionClos'
    // }
    //
    // await this.#actionRepository.drop(action)
    // await this.#demandeDeSubventionRepository.drop(demandesDeSubvention.state.uid.value)
    // await this.#coFinancementRepository.drop(action.state.uid.value)

    return 'OK'
  }
}

type Failure = 'conflitExisteSubventionClos' | 'suppressionActionNonAutorisee'
type Command = Readonly<{
  uidAction: string
  uidGestionnaire: string
}>

