import { PropsWithChildren, ReactElement } from 'react'

export default function Resume({ children, style }: Props): ReactElement {
  return (
    // eslint-disable-next-line
    // eslint-disable-next-line no-warning-comments, sonarjs/todo-tag
    // TODO: conditionner le style avec le viewmodel si note privee ou pas
    // avant ==> <div className="fr-col-12 fr-col-md-4 fr-col-sm-6"></div>
    <div className="fr-col-6">
      <div className={`fr-card color-blue-france ${style}`}>
        <div className="fr-card__body">
          <div className="fr-card__content">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

type Props = PropsWithChildren<Readonly<{
  style: string
}>>
