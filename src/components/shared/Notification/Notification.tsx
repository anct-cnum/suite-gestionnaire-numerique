import { toast } from 'react-toastify'

import styles from './Notification.module.css'

export function Notification(
  status: 'error' | 'success',
  { description, title }: { description: string; title: string }
): void {
  toast(
    <div>
      <span className={`fr-notice__title fr-icon-${status}-fill`}>{title}</span>
      <span className="fr-notice__desc">{description}</span>
    </div>,
    // Stryker disable next-line ObjectLiteral
    {
      className: styles[`toastify-${status}`],
      position: 'top-center',
      role: status === 'error' ? 'alert' : 'status',
    }
  )
}

// Une server action a levé une exception : panne technique, déjà signalée à Sentry côté serveur
// (onRequestError). L'utilisateur ne reçoit qu'un message générique, sans détail technique.
export function notifierErreurInattendue(): void {
  Notification('error', {
    description: 'un problème technique est survenu, veuillez réessayer plus tard.',
    title: 'Erreur : ',
  })
}
