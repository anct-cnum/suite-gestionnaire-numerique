import { PropsWithChildren, ReactElement } from 'react'

// Alerte DSFR (fr-alert) : titre de niveau 3 + message. Les variantes
// information et succès sont annoncées en `status`, avertissement et erreur
// en `alert` (lecteurs d'écran).
export default function Alerte({ children, titre, type = 'info' }: Props): ReactElement {
  return (
    <div
      className={`fr-alert fr-alert--${type} fr-mb-3w`}
      role={type === 'info' || type === 'success' ? 'status' : 'alert'}
    >
      <h3 className="fr-alert__title">{titre}</h3>
      {typeof children === 'string' ? <p>{children}</p> : children}
    </div>
  )
}

type Props = PropsWithChildren<
  Readonly<{
    titre: string
    type?: 'error' | 'info' | 'success' | 'warning'
  }>
>
