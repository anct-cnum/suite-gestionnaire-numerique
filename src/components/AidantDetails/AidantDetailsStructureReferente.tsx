import { ReactElement } from 'react'

export default function AidantDetailsStructureReferente(props: Props): null | ReactElement {
  const { referent } = props

  if (!referent || !referent.email && !referent.nom && !referent.post && !referent.prenom && !referent.telephone) {
    return null
  }

  const { email, nom, post, prenom, telephone: tel } = referent

  return (
    <div
      className="fr-p-3w"
      style={{
        backgroundColor: 'var(--blue-france-975-75)',
      }}
    >
      <p
        className="fr-text--xs fr-text--bold fr-text--uppercase fr-mb-1w"
        style={{ color: 'var(--text-title-blue-france)', textTransform: 'uppercase' }}
      >
        Référent de la structure
      </p>
      {prenom || nom || post ?
        <p
          className="fr-text--md fr-text--bold fr-mb-1w"
          style={{ color: 'var(--grey-50-1000)' }}
        >
          {prenom && nom ? `${prenom} ${nom}` : prenom || nom}
          {(prenom || nom) && post ? ', ' : ''}
          {post}
        </p> : null}
      <p
        className="fr-callout__text fr-text-base fr-mb-0"
        style={{ color: '#3A3A3A', fontWeight: '500' }}
      >
        {email ?
          <span className="fr-mr-2w">
            <span
              aria-hidden="true"
              className="fr-icon-mail-line fr-mr-1w"
              style={{ height: '12px', width: '12px' }}
            />
            {email}
          </span> : null}
        {tel ?
          <span>
            <span
              aria-hidden="true"
              className="fr-icon-phone-line fr-mr-1w"
              style={{ height: '12px', width: '12px' }}
            />
            {tel}
          </span> : null}
      </p>
    </div>
  )
}

type Props = Readonly<{
  referent?: Readonly<{
    email: string
    nom: string
    post: string
    prenom: string
    telephone: string
  }>
}>
