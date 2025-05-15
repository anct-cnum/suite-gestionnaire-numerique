// eslint-disable-next-line func-style
const checkIsNaN: <Value>(value: Value) => boolean = <Value>(value: Value) => typeof value === 'number' && isNaN(value)

export abstract class Optional<Value> {
  static empty<Value>(): Optional<Value> {
    return new EmptyOptional()
  }

  static of<Value>(value: Value): Optional<Value> {
    return new ValuatedOptional(value)
  }

  static ofNullable<Value>(value: null | undefined | Value): Optional<Value> {
    if (value === undefined || value === null || checkIsNaN(value)) {
      return Optional.empty()
    }
    return Optional.of(value)
  }

  abstract filter(predicate: (value: Value) => boolean): Optional<Value>
  abstract flatMap<Output>(mapper: (feature: Value) => Optional<Output>): Optional<Output>
  abstract ifPresent(consumer: (feature: Value) => void): void
  abstract isEmpty(): boolean
  abstract isPresent(): boolean
  abstract map<Output>(mapper: (value: Value) => Output): Optional<Output>
  abstract or(factory: () => Optional<Value>): Optional<Value>
  abstract orElse(value: Value): Value
  abstract orElseGet(factory: () => Value): Value
  abstract orElseThrow<U = Error>(throwable?: () => U): Value
  abstract toArray(): Array<Value>
}

class EmptyOptional<Value> extends Optional<Value> {
  filter(): Optional<Value> {
    return this
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  flatMap<Output>(): Optional<Output> {
    return Optional.empty()
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  ifPresent(): void {
    // Nothing to do
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  isEmpty(): boolean {
    return true
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  isPresent(): boolean {
    return false
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  map<Output>(): Optional<Output> {
    return Optional.empty()
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  or(factory: () => Optional<Value>): Optional<Value> {
    return factory()
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  orElse(value: Value): Value {
    return value
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  orElseGet(factory: () => Value): Value {
    return factory()
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  orElseThrow<U>(throwable?: () => U): Value {
    if (throwable === undefined) {
      throw new Error("Can't get value from an empty optional")
    }

    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw throwable()
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  toArray(): Array<Value> {
    return []
  }
}

class ValuatedOptional<Value> extends Optional<Value> {
  // eslint-disable-next-line @typescript-eslint/parameter-properties
  constructor(private readonly value: Value) {
    super()
  }

  filter(predicate: (value: Value) => boolean): Optional<Value> {
    if (predicate(this.value)) {
      return this
    }

    return Optional.empty()
  }

  flatMap<Output>(mapper: (feature: Value) => Optional<Output>): Optional<Output> {
    return mapper(this.value)
  }

  ifPresent(consumer: (feature: Value) => void): void {
    consumer(this.value)
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  isEmpty(): boolean {
    return false
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  isPresent(): boolean {
    return true
  }

  map<Output>(mapper: (value: Value) => Output): Optional<Output> {
    return Optional.of(mapper(this.value))
  }

  or(): Optional<Value> {
    return Optional.of(this.value)
  }

  orElse(): Value {
    return this.value
  }

  orElseGet(): Value {
    return this.value
  }

  orElseThrow(): Value {
    return this.value
  }

  toArray(): Array<Value> {
    return [this.value]
  }
}
