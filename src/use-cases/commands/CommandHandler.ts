export interface CommandHandler<Command, Failure = string> {
  execute: (command: Command) => ResultAsync<Failure>
}

export type ResultAsync<Failure> = Promise<Result<Failure>>

type ResultOk = 'OK'

type Result<Failure> = Failure | ResultOk
