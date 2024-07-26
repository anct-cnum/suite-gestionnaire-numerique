export interface Model {
  state: () => Readonly<Record<string, unknown>>
}
