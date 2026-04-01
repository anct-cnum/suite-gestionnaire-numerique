import classNames from 'classnames'
import { PropsWithChildren, ReactElement } from 'react'

export default function PageTitle({ children, className = '', margin = 'fr-mt-5w' }: Props): ReactElement {
  return <h1 className={classNames('color-blue-france', className, margin)}>{children}</h1>
}

type Props = PropsWithChildren<
  Readonly<{
    className?: string
    margin?: string
  }>
>
