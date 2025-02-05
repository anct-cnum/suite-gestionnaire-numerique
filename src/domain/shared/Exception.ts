import { Result } from '@/shared/lang'

export class Exception<Failure extends string> extends Error {
  private constructor(failure: Failure) {
    super(failure)
  }

  static toResult<Failure extends string>(run: () => never | void): Result<Failure> {
    try {
      run()
      return 'OK'
    } catch (error: unknown) {
      return (error as Exception<Failure>).message as Failure
    }
  }

  static of<Failure extends string>(failure: Failure): Exception<Failure> {
    return new Exception(failure)
  }
}
