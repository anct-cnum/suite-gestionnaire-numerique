import { ErrorViewModel } from './ErrorViewModel'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export function handleReadModelOrError<T, U>(
  readModel: ErrorReadModel | T,
  presenter: (readModel: T) => U
): ErrorViewModel | U {
  if (isErrorReadModel(readModel)) {
    return {
      message: readModel.message,
      type: 'error',
    }
  }

  return presenter(readModel)
}

export function isErrorReadModel(readModel: unknown): readModel is ErrorReadModel {
  return typeof readModel === 'object' && readModel !== null && 'type' in readModel && readModel.type === 'error'
}
