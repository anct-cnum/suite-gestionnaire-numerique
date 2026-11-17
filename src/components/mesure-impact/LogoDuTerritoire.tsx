import { ReactElement } from 'react'

// Logo du territoire pilote, en dur comme dans les maquettes : il viendra de la campagne quand il y en aura d'autres
export default function LogoDuTerritoire({ className }: Readonly<{ className?: string }>): ReactElement {
  return (
    <img
      alt="Sicoval – L’Agglo du Sud-Est Toulousain"
      className={className}
      height={64}
      src="/mesure-impact/logo-sicoval.svg"
      width={155}
    />
  )
}
