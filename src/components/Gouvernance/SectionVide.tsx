import { PropsWithChildren, ReactElement } from 'react'

export default function SectionVide({ children, id, title }: Props): ReactElement {
  return (
    <>
      <header>
        <h2
          className="color-blue-france"
          id={id}
        >
          {title}
        </h2>
      </header>
      <article className="background-blue-france fr-p-6w fr-mb-4w center">
        {children}
      </article>
    </>
  )
}

type Props = PropsWithChildren<Readonly<{
  id: string
  title: string
}>>
