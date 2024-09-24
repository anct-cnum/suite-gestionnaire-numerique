import { Result } from '@/util/result'

export interface CommandHandler<Command, Failure = string> {
  execute: (command: Command) => ResultAsync<Failure>
}

export type ResultAsync<Failure> = Promise<Result<Failure>>
