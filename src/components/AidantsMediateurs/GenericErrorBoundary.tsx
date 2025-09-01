'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

export default class AsyncLoaderErrorBoundary extends Component<Props, State> {
  static readonly defaultProps = {
    fallback: undefined,
    onError: undefined,
  }

  constructor(props: Props) {
    super(props)
    this.state = { error: undefined, hasError: false }
  }

  // eslint-disable-next-line react/sort-comp
  static getDerivedStateFromError(error: Error): State {
    // Mettre à jour l'état pour que le prochain rendu affiche l'interface de secours
    return { error, hasError: true }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError } = this.props
    // Appeler le callback onError si fourni
    if (onError) {
      onError(error, errorInfo)
    } else {
      // Logger par défaut si pas de callback
      // eslint-disable-next-line no-console
      console.error('Error caught by ErrorBoundary:', error, errorInfo)
    }
  }

  override render(): ReactNode {
    const { error, hasError } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      // Si un fallback est fourni, l'utiliser
      if (fallback !== undefined) {
        if (typeof fallback === 'function') {
          return fallback(error)
        }
        return fallback
      }
      
      // Fallback par défaut
      return (
        <div className="fr-display--xs fr-mb-0 color-orange">
          -
        </div>
      )
    }

    return children
  }

  // eslint-disable-next-line react/sort-comp
  override shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    const { error, hasError } = this.state
    const { error: nextError, hasError: nextHasError } = nextState
    const { children } = this.props

    // Re-render si l'état d'erreur change ou si les enfants changent
    return (
      hasError !== nextHasError ||
      error !== nextError ||
      children !== nextProps.children
    )
  }
}

type Props = Readonly<{
  children: ReactNode
  fallback?: ((error?: Error) => ReactNode) | ReactNode
  onError?(error: Error, errorInfo: ErrorInfo): void
}>

type State = {
  error?: Error
  hasError: boolean
}