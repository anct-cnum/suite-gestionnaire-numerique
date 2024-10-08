import { Result, ResultOk } from '@/util/result'

export interface CommandHandler<Command, Failure = string, Success = ResultOk> {
  execute: (command: Command) => ResultAsync<Failure, Success>
}

export type ResultAsync<Failure, Success = ResultOk> = Promise<Result<Failure, Success>>
