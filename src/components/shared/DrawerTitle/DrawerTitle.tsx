import { PropsWithChildren, ReactElement } from 'react'

export default function DrawerTitle({ children, id, niveauTitre: Titre = 'h3' }: Props): ReactElement {
  return (
    <Titre className="color-blue-france fr-h3 fr-mb-2w" id={id}>
      {children}
    </Titre>
  )
}

type Props = PropsWithChildren<
  Readonly<{
    id: string
    // Le site vitrine titre ses volets en h1, à la demande de l'auditeur RGAA (critère 9.1, #2357)
    niveauTitre?: 'h1' | 'h3'
  }>
>
