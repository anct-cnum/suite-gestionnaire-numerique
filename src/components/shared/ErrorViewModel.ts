export type ErrorViewModel = Readonly<{
  message: string
  type: 'error'
}>

export function isErrorViewModel(viewModel: unknown): viewModel is ErrorViewModel {
  return typeof viewModel === 'object' && viewModel !== null && 'type' in viewModel && viewModel.type === 'error'
}