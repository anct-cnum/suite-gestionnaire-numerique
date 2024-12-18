import { Exception } from './Exception'

export class ValidDate<Failure extends string> extends Date {
  constructor(date: Date, failure: Failure) {
    if (isNaN(date.getTime())) {
      throw Exception.of<Failure>(failure)
    }
    super(date)
  }
}
