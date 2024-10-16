import { Result, ResultOk } from '@/shared/result'

export interface CommandHandler<Command, Failure = string, Success = ResultOk> {
  execute: (command: Command) => ResultAsync<Failure, Success>
}

export type ResultAsync<Failure, Success = ResultOk> = Promise<Result<Failure, Success>>
