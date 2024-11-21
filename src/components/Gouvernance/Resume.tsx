import { PropsWithChildren, ReactElement } from 'react'

export default function Resume({ children, style }: ResumeProps): ReactElement {
  return (
    <div className="fr-col-md-4">
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

type ResumeProps = PropsWithChildren<Readonly<{
  style: string
}>>
