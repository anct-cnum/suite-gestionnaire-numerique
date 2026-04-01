import { Exception } from './Exception'

export class ValidDate<Failure extends string> extends Date {
  constructor(date: Date, failure: Failure) {
    if (isNaN(date.getTime())) {
      throw Exception.of(failure)
    }
    super(date)
  }
}

//Transforme une date en année en format string vers une date en format Date
export class ValidDateFromYearString<Failure extends string> extends Date {
  constructor(year: string, failure: Failure) {
    if (typeof year !== 'string') {
      throw Exception.of(failure)
    }
    const date = new Date(`${year}-01-01T00:00:00Z`)
    if (isNaN(date.getTime())) {
      throw Exception.of(failure)
    }
    super(date)
  }
}
