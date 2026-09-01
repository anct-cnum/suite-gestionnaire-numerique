import { PropsWithChildren, ReactElement } from 'react'

export default function TableauVide({ children, variante = 'caramel' }: Props): ReactElement {
  return (
    <div className={`${varianteClasses[variante]} border-radius fr-p-4w center`}>
      <p className="fr-text--md fr-mb-0">{children}</p>
    </div>
  )
}

const varianteClasses = {
  bleuFrance: 'fr-background-alt--blue-france',
  caramel: 'fr-background-alt--brown-caramel',
}

type Props = PropsWithChildren<
  Readonly<{
    variante?: keyof typeof varianteClasses
  }>
>
