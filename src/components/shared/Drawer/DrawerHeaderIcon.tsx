import { ReactElement } from 'react'

export default function DrawerHeaderIcon({ iconName }: DrawerHeaderIconProps): ReactElement {
  return (
    <div className="fr-h1 fr-mb-0">
      <span
        aria-hidden="true"
        className={`fr-icon-${iconName} icon-title`}
      />
    </div>
  )
}

type DrawerHeaderIconProps = Readonly<{
  iconName: string
}>
