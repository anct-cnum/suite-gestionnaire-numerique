import { toast } from 'react-toastify'

import styles from './Notification.module.css'

export function Notification(status: 'success' | 'error', { description, title }: { description: string; title: string }): void {
  toast((
    <div>
      <span className={`fr-notice__title fr-icon-${status}-fill`}>
        {title}
      </span>
      <span className="fr-notice__desc">
        {description}
      </span>
    </div>
  ),
  // Stryker disable next-line ObjectLiteral
  {
    className: styles[`toastify-${status}`],
    position: 'top-center',
  })
}
