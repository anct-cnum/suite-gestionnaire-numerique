import { PropsWithChildren, ReactElement } from 'react'

export default function Title({ children, icon }: TitleProps): ReactElement {
  return (
    <h1 className="color-blue-france fr-mt-5w">
      <span
        aria-hidden="true"
        className={`fr-icon-${icon} icon-title fr-mr-3w`}
      />
      {children}
    </h1>
  )
}

type TitleProps = PropsWithChildren<Readonly<{
  icon: string
}>>
