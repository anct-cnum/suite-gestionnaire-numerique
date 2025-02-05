import { Result, ResultOk, Struct } from '@/shared/lang'

export interface CommandHandler<Command extends Struct, Failure = string, Success = ResultOk> {
  handle(command: Command): ResultAsync<Failure, Success>
}

export type ResultAsync<Failure, Success = ResultOk> = Promise<Result<Failure, Success>>
