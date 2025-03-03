import { PropsWithChildren, ReactElement } from 'react'

import TitleIcon from '../TitleIcon/TitleIcon'

export default function PageTitle({ children, icon }: Props): ReactElement {
  return (
    <h1 className="color-blue-france fr-mt-5w">
      <TitleIcon icon={icon} />
      {children}
    </h1>
  )
}

type Props = PropsWithChildren<Readonly<{
  icon: string
}>>
