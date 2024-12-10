import { CommandHandler, ResultAsync } from '../CommandHandler'

export class AjouterUnComite implements CommandHandler<Command> {
  async execute({ }: Command): ResultAsync<Failure> {
    return 'OK'
  }
}

type Failure = string

type Command = Readonly<{
  commentaire?: string
  date?: string
  frequence: string
  gouvernanceUid: string
  type: string
  utilisateurUid: string
}>
