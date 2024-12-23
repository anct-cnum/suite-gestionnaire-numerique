import { PropsWithChildren, ReactElement } from 'react'

import Icon from '../Icon/Icon'

export default function PageTitle({ children, icon }: Props): ReactElement {
  return (
    <h1 className="color-blue-france fr-mt-5w">
      <Icon icon={icon} />
      {children}
    </h1>
  )
}

type Props = PropsWithChildren<Readonly<{
  icon: string
}>>
